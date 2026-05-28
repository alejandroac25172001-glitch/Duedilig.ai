import asyncio
import json
import re

import anthropic
from google import genai
from google.genai import types as genai_types

from app.core.config import settings


_GEMINI_PROMPT = (
    "Extrae TODO el texto del documento PDF de manera fiel y completa. "
    "Incluye todos los títulos, cláusulas, párrafos, numeraciones y cualquier texto visible. "
    "Si el documento está escaneado o es una imagen, usa tus capacidades de visión para "
    "reconocer y transcribir el texto exactamente como aparece. "
    "No resumas, no parafrasees, no omitas nada. "
    "Devuelve únicamente el texto del documento."
)

# Braces inside the JSON schema example must be doubled to escape Python's str.format()
_CLAUDE_PROMPT = """\
Eres un abogado experto en derecho colombiano, especializado en protección de datos \
personales y habeas data financiero.

Analiza el siguiente texto de un contrato colombiano para determinar si contiene una \
cláusula de autorización de tratamiento de datos personales, conforme a:
- Ley 1581 de 2012 (Régimen General de Protección de Datos Personales)
- Decreto 1377 de 2013 (Reglamentación de la Ley 1581)
- Ley 1266 de 2008 (Habeas Data Financiero)

━━━ CRITERIOS DE EVALUACIÓN ━━━

**tiene_autorizacion**
¿El contrato incluye alguna cláusula o declaración que autorice expresamente al \
responsable del tratamiento a recopilar, almacenar o usar datos personales del \
firmante o deudor? La autorización debe ser libre, previa, expresa e informada \
(Art. 9, Ley 1581).

**menciona_centrales_riesgo**
¿La autorización menciona EXPLÍCITAMENTE el reporte o consulta de información ante \
centrales de información crediticia o de riesgo?
Términos que califican: "centrales de riesgo", "centrales de información", \
"operadores de información financiera", "Datacrédito", "TransUnión", "TransUnion", \
"CIFIN", "PROCREDITO", "bases de datos de crédito", "historial crediticio", \
"reporte de incumplimiento", "reporte negativo".

**nivel_riesgo**
- "ALTO"  → No existe cláusula de autorización de datos personales. Incumplimiento \
de la Ley 1581 y la Ley 1266. Cualquier reporte a centrales sería ilegal.
- "MEDIO" → Existe autorización genérica de tratamiento de datos, pero NO menciona \
explícitamente las centrales de riesgo. El reporte podría ser cuestionado judicialmente.
- "BAJO"  → La autorización menciona explícitamente las centrales de riesgo o la cesión \
de datos a operadores financieros. Cumple los requisitos de la normativa colombiana.

**fragmento_relevante**
Cita textualmente el fragmento más relevante del contrato donde aparece la cláusula de \
autorización (o la parte más cercana a ella). Si no existe ningún fragmento relevante, \
devuelve null.

**resumen**
En 2 o 3 oraciones, explica el hallazgo principal y sus implicaciones legales concretas \
bajo la normativa colombiana vigente.

**confianza**
Número entero de 0 a 100. Reduce la confianza si el texto está ilegible, incompleto, \
es muy breve o resulta ambiguo para determinar la presencia de la cláusula.

━━━ TEXTO DEL CONTRATO ━━━
{text}
━━━ FIN DEL TEXTO ━━━

Responde ÚNICAMENTE con un objeto JSON válido. Sin bloques de código markdown, \
sin texto adicional antes ni después del JSON:
{{
  "tiene_autorizacion": true,
  "menciona_centrales_riesgo": false,
  "nivel_riesgo": "ALTO",
  "fragmento_relevante": null,
  "resumen": "...",
  "confianza": 85
}}"""


def _extract_text_sync(pdf_bytes: bytes) -> str:
    """Runs in a thread pool — google.genai is synchronous."""
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            genai_types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
            _GEMINI_PROMPT,
        ],
    )
    return response.text or ""


async def _extract_text_with_gemini(pdf_bytes: bytes) -> str:
    return await asyncio.to_thread(_extract_text_sync, pdf_bytes)


async def _analyze_with_claude(text: str) -> dict:
    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    message = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": _CLAUDE_PROMPT.format(text=text)},
        ],
    )

    raw = message.content[0].text.strip()

    # Strip accidental markdown code fences that some models add
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Claude devolvió una respuesta que no es JSON válido: {raw[:200]}") from exc


def _validate_analysis(data: dict) -> dict:
    """Ensure all required keys are present and values are within expected ranges."""
    required = {"tiene_autorizacion", "menciona_centrales_riesgo", "nivel_riesgo", "resumen", "confianza"}
    missing = required - data.keys()
    if missing:
        raise ValueError(f"Faltan campos en la respuesta de Claude: {missing}")

    if data["nivel_riesgo"] not in {"ALTO", "MEDIO", "BAJO"}:
        raise ValueError(f"nivel_riesgo inválido: {data['nivel_riesgo']!r}")

    confianza = int(data["confianza"])
    if not 0 <= confianza <= 100:
        raise ValueError(f"confianza fuera de rango: {confianza}")

    return {
        "tiene_autorizacion": bool(data["tiene_autorizacion"]),
        "menciona_centrales_riesgo": bool(data["menciona_centrales_riesgo"]),
        "nivel_riesgo": data["nivel_riesgo"],
        "fragmento_relevante": data.get("fragmento_relevante"),
        "resumen": str(data["resumen"]),
        "confianza": confianza,
    }


async def analyze_document(pdf_bytes: bytes, filename: str) -> dict:
    """
    Full pipeline: Gemini extracts text → Claude analyzes Colombian data-authorization clause.

    Returns a dict with keys: filename, tiene_autorizacion, menciona_centrales_riesgo,
    nivel_riesgo, fragmento_relevante, resumen, confianza.
    """
    extracted_text = await _extract_text_with_gemini(pdf_bytes)

    if not extracted_text.strip():
        raise ValueError(
            "Gemini no pudo extraer texto del PDF. "
            "Verifique que el archivo sea un PDF válido y no esté protegido con contraseña."
        )

    raw_analysis = await _analyze_with_claude(extracted_text)
    analysis = _validate_analysis(raw_analysis)

    return {"filename": filename, **analysis}
