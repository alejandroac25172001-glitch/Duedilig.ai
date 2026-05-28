"""
Test de integración con Gemini Vision.

Crea un PDF de prueba, lo envía a Gemini para extracción de texto
y muestra el resultado. No llama a Claude, por lo que ANTHROPIC_API_KEY
puede ser cualquier valor (dummy).

Ejecutar desde la carpeta backend/:
    python test_gemini.py
"""

import asyncio

from fpdf import FPDF

# app.services.ai_service usa settings, que carga backend/.env
from app.services.ai_service import _extract_text_with_gemini


# -- Crear PDF de prueba ------------------------------------------------------

def create_test_pdf() -> bytes:
    from fpdf.enums import XPos, YPos

    pdf = FPDF()
    pdf.set_margins(20, 20, 20)
    pdf.add_page()

    # Titulo
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(
        0, 12, "CONTRATO DE CREDITO DE CONSUMO",
        new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C",
    )
    pdf.ln(4)

    sections = [
        (
            "PRIMERA. PARTES",
            "Entre BANCO EJEMPLO S.A. (EL BANCO) y JUAN PEREZ GOMEZ, "
            "C.C. 1.234.567 (EL DEUDOR), se celebra el presente contrato.",
        ),
        (
            "SEGUNDA. OBJETO",
            "EL BANCO otorga a EL DEUDOR un credito de consumo por valor de "
            "CINCO MILLONES DE PESOS ($5.000.000 COP), pagadero en 24 cuotas "
            "mensuales a una tasa del 1.8% mensual.",
        ),
        (
            "TERCERA. OBLIGACIONES",
            "EL DEUDOR se compromete a pagar puntualmente las cuotas pactadas "
            "y a notificar cualquier cambio en su informacion personal o financiera.",
        ),
        (
            "CUARTA. AUTORIZACION DE DATOS PERSONALES Y REPORTE A CENTRALES DE RIESGO",
            "De conformidad con la Ley 1581 de 2012, el Decreto 1377 de 2013 y "
            "la Ley 1266 de 2008 (Habeas Data Financiero), EL DEUDOR autoriza "
            "expresa, libre e informadamente a EL BANCO para: (i) recopilar, "
            "almacenar, usar y circular sus datos personales y financieros; "
            "(ii) reportar, consultar y actualizar su informacion crediticia ante "
            "las centrales de riesgo Datacredito (Experian Colombia S.A.), "
            "TransUnion Colombia S.A. y CIFIN, incluyendo reportes de cumplimiento "
            "e incumplimiento; (iii) compartir dicha informacion con otras "
            "entidades del sistema financiero segun la normativa vigente.",
        ),
        (
            "QUINTA. VIGENCIA",
            "El presente contrato tiene vigencia desde la fecha de firma "
            "hasta la cancelacion total de la obligacion.",
        ),
    ]

    for title, body in sections:
        pdf.set_font("Helvetica", "B", 11)
        pdf.multi_cell(0, 7, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("Helvetica", size=10)
        pdf.multi_cell(0, 6, body, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(3)

    pdf.set_font("Helvetica", "I", 9)
    pdf.cell(0, 8, "Firma EL DEUDOR: ____________________   Firma EL BANCO: ____________________",
             new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    return bytes(pdf.output())


# -- Main ---------------------------------------------------------------------

async def main() -> None:
    print("=" * 60)
    print("  TEST — Extracción de texto con Gemini Vision")
    print("=" * 60)

    print("\n[1/2] Generando PDF de prueba con fpdf2...")
    pdf_bytes = create_test_pdf()
    print(f"      PDF generado: {len(pdf_bytes):,} bytes")

    print("\n[2/2] Enviando PDF a Gemini 2.0 Flash para extracción de texto...")
    print("      (esto puede tardar 5-15 segundos)\n")

    try:
        extracted = await _extract_text_with_gemini(pdf_bytes)
    except Exception as exc:
        import traceback
        print("[ERROR] Gemini falló con el siguiente traceback completo:")
        print("-" * 60)
        traceback.print_exc()
        print("-" * 60)
        print(f"\nTipo de excepción : {type(exc).__name__}")
        print(f"Mensaje           : {exc}")
        return

    sep = "-" * 60
    print(sep)
    print("TEXTO EXTRAÍDO POR GEMINI:")
    print(sep)
    print(extracted)
    print(sep)
    print(f"\nCaracteres extraídos: {len(extracted)}")

    keywords = ["Datacrédito", "centrales de riesgo", "Ley 1581", "TransUnión", "CIFIN"]
    found = [kw for kw in keywords if kw.lower() in extracted.lower()]
    print(f"Palabras clave encontradas: {found if found else 'ninguna'}")
    print("\n[OK] Test completado exitosamente." if found else "\n[WARN] No se detectaron palabras clave esperadas.")


if __name__ == "__main__":
    asyncio.run(main())
