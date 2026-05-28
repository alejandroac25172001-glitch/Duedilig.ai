# duedilig-ai

> Due diligence automatizada de contratos colombianos con IA. Detecta en segundos si un contrato incluye la cláusula de autorización de datos personales para reporte a centrales de riesgo.

**Repositorio:** https://github.com/alejandroac25172001-glitch/Duedilig.ai

---

## ¿Qué hace?

En Colombia, los contratos con obligaciones financieras o crediticias deben incluir una cláusula explícita que autorice al acreedor a recopilar, tratar y reportar los datos del deudor ante las centrales de riesgo (Datacrédito, TransUnión, CIFIN), conforme a la **Ley 1581 de 2012**, el **Decreto 1377 de 2013** y la **Ley 1266 de 2008** (habeas data financiero).

**duedilig-ai** automatiza esa revisión: subes uno o varios PDF y la herramienta usa IA para determinar, por cada documento:

| Campo | Descripción |
|-------|-------------|
| `tiene_autorizacion` | Si existe cláusula de autorización de tratamiento de datos |
| `menciona_centrales_riesgo` | Si menciona explícitamente reporte/consulta a centrales de riesgo |
| `nivel_riesgo` | **ALTO** (sin cláusula), **MEDIO** (genérica), **BAJO** (cumple) |
| `fragmento_relevante` | Cita textual de la cláusula encontrada |
| `resumen` | Hallazgo principal e implicaciones legales |
| `confianza` | Nivel de certeza del análisis (0–100) |

Procesa documentos **en paralelo**, genera un **resumen global de cumplimiento** y permite **exportar los resultados a Excel** con código de colores por nivel de riesgo.

### Cómo funciona (pipeline)

```
PDF  ──►  Gemini 2.0 Flash  ──►  Claude Sonnet 4.6  ──►  Resultado JSON
          (extracción de         (análisis legal
           texto / visión)        bajo normativa CO)
```

1. **Gemini 2.0 Flash** extrae el texto completo del PDF, incluyendo documentos escaneados (visión multimodal).
2. **Claude Sonnet 4.6** analiza el texto como abogado experto en habeas data colombiano y devuelve el dictamen estructurado.

### Casos de uso

- Revisión masiva de contratos antes de constituir una cartera de crédito
- Auditorías de cumplimiento normativo
- Pre-aprobación de contratos por equipos legales
- Due diligence en procesos de adquisición o fusión

---

## Stack tecnológico

**Backend**
- Python 3.11+
- FastAPI · Uvicorn
- Pydantic v2 · pydantic-settings
- Anthropic SDK (Claude `claude-sonnet-4-6`)
- Google GenAI SDK (Gemini `gemini-2.0-flash`)
- openpyxl (exportación a Excel)

**Frontend**
- Node.js 18+
- React 18 · Vite
- Tailwind CSS
- axios

---

## Estructura del proyecto

```
duedilig-ai/
├── backend/                  # API REST en Python + FastAPI
│   ├── app/
│   │   ├── api/routes/       # Endpoints (upload, export Excel)
│   │   ├── core/             # Configuración y variables de entorno
│   │   ├── models/           # Esquemas Pydantic (request/response)
│   │   ├── services/         # Lógica de IA (Gemini + Claude)
│   │   └── main.py           # App FastAPI + CORS
│   ├── requirements.txt
│   └── .env                  # Tus API keys (NO se versiona)
├── frontend/                 # SPA en React + Tailwind CSS
│   └── src/
│       ├── components/       # Componentes reutilizables
│       ├── pages/            # Vistas: Upload y Dashboard
│       └── services/         # Cliente de la API
├── .env.example              # Plantilla de variables de entorno
├── .gitignore
└── README.md
```

---

## Instalación

> Requisitos previos: **Python 3.11+** y **Node.js 18+** instalados.

Clona el repositorio y entra en la carpeta:

```bash
git clone <url-del-repositorio>
cd duedilig-ai
```

### 1. Backend

```bash
cd backend

# Crear y activar un entorno virtual
python -m venv venv
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
```

---

## Configuración del `.env`

Las API keys se leen desde `backend/.env`. Crea ese archivo a partir de la plantilla:

```bash
# desde la raíz del proyecto
cp .env.example backend/.env
```

Edita `backend/.env` y completa tus claves:

```env
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...
```

### ¿Dónde obtener las claves?

| Variable | Dónde generarla | Formato esperado |
|----------|-----------------|------------------|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys | empieza con `sk-ant-` |
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey | empieza con `AIzaSy` |

> **Importante:** la `GEMINI_API_KEY` debe ser una clave de **Google AI Studio** (formato `AIzaSy...`). Para evitar problemas de cuota, créala con la opción *"Create API key in new project"*.
>
> El archivo `.env` está incluido en `.gitignore` y **nunca debe subirse al repositorio**.

---

## Cómo correr el proyecto

Necesitas **dos terminales** corriendo en paralelo.

### Terminal 1 — Backend

```bash
cd backend
# (con el venv activado)
python -m uvicorn app.main:app --reload
```

- API: `http://localhost:8000`
- Documentación interactiva (Swagger): `http://localhost:8000/docs`

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

- App web: `http://localhost:5173`

Abre `http://localhost:5173` en el navegador, sube tus PDF y revisa el dashboard con los resultados.

---

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/analysis/upload` | Sube uno o varios PDF y devuelve el análisis + resumen global |
| `POST` | `/api/v1/analysis/export/excel` | Genera un Excel con los resultados coloreados por riesgo |
| `GET`  | `/health` | Health check del servicio |

---

## Marco legal de referencia

- **Ley 1266 de 2008** — Régimen de datos financieros y de crédito (habeas data financiero)
- **Ley 1581 de 2012** — Régimen general de protección de datos personales
- **Decreto 1377 de 2013** — Reglamentación de la Ley 1581
- **Circular Externa 002 de 2021** — Instrucciones de la SIC sobre tratamiento de datos

---

## Aviso legal

Esta herramienta es un apoyo automatizado y **no sustituye la asesoría de un profesional del derecho**. Los resultados deben ser validados por un equipo legal antes de tomar decisiones.
