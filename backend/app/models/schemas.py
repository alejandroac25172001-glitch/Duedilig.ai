from enum import Enum
from pydantic import BaseModel


class ClauseStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    INSUFFICIENT = "insufficient"
    UNKNOWN = "unknown"


class AnalysisRequest(BaseModel):
    provider: str = "anthropic"


class ClauseDetail(BaseModel):
    status: ClauseStatus
    excerpt: str | None = None
    page: int | None = None
    confidence: float | None = None
    observations: str | None = None


class AnalysisResponse(BaseModel):
    filename: str
    clause_status: ClauseStatus
    detail: ClauseDetail
    raw_text_preview: str | None = None
    provider_used: str


# ── Batch analysis ──────────────────────────────────────────────────────────

class DocumentResult(BaseModel):
    filename: str
    tiene_autorizacion: bool
    menciona_centrales_riesgo: bool
    nivel_riesgo: str           # "ALTO" | "MEDIO" | "BAJO" | "ERROR"
    fragmento_relevante: str | None = None
    resumen: str
    confianza: int              # 0-100; 0 when nivel_riesgo == "ERROR"


class GlobalSummary(BaseModel):
    total: int
    alto: int
    medio: int
    bajo: int
    errores: int
    porcentaje_cumplimiento: float   # (bajo / (total - errores)) * 100


class BatchAnalysisResponse(BaseModel):
    resultados: list[DocumentResult]
    resumen_global: GlobalSummary


class ExportRequest(BaseModel):
    resultados: list[DocumentResult]
