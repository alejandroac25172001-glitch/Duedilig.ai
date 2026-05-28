from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analysis
from app.core.config import settings

app = FastAPI(
    title="duedilig-ai",
    description="Análisis de cláusulas de autorización de datos personales en contratos colombianos",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["analysis"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
