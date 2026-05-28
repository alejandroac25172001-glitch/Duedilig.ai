"""
Llamada minima directa a la API de Gemini para validar la GEMINI_API_KEY.

Ejecutar desde la carpeta backend/:
    python test_key.py
"""

import os
import traceback

from dotenv import load_dotenv
from google import genai

load_dotenv()  # lee backend/.env

api_key = os.getenv("GEMINI_API_KEY", "")
print(f"Key cargada: {api_key[:8]}...{api_key[-4:] if len(api_key) > 12 else ''} "
      f"(longitud: {len(api_key)})")

try:
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="di hola",
    )
    print("\n[OK] Respuesta de Gemini:")
    print(response.text)
except Exception as exc:
    print("\n[ERROR] La llamada a Gemini fallo. Traceback completo:")
    print("-" * 60)
    traceback.print_exc()
    print("-" * 60)
    print(f"\nTipo de excepcion : {type(exc).__name__}")
    print(f"Mensaje           : {exc}")
