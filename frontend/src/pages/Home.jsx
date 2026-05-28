import { useState, useRef } from 'react'
import FileUpload from '../components/FileUpload'
import { analyzeContracts, MOCK_RESULTS } from '../services/api'

const STAGES = [
  { at: 12, label: 'Cargando archivos al servidor...' },
  { at: 38, label: 'Extrayendo texto con Gemini Vision...' },
  { at: 68, label: 'Analizando cláusulas con Claude...' },
  { at: 90, label: 'Consolidando resultados...' },
]

export default function Home({ onResults }) {
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  const startSimulation = () => {
    let idx = 0
    const tick = () => {
      if (idx >= STAGES.length) return
      const { at, label } = STAGES[idx++]
      setProgress(at)
      setStage(label)
      timerRef.current = setTimeout(tick, 3200)
    }
    tick()
  }

  const finishSimulation = () => {
    clearTimeout(timerRef.current)
    setProgress(100)
    setStage('¡Análisis completado!')
  }

  const handleAnalyze = async () => {
    if (files.length === 0) return
    setIsLoading(true)
    setProgress(0)
    setError(null)
    startSimulation()
    try {
      const data = await analyzeContracts(files)
      finishSimulation()
      setTimeout(() => onResults(data), 700)
    } catch (err) {
      clearTimeout(timerRef.current)
      setIsLoading(false)
      setProgress(0)
      setError(err.message ?? 'Error al conectar con el servidor.')
    }
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100">
      {/* ── Header ── */}
      <header className="border-b border-slate-800/80 px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-slate-50 leading-none">duedilig-ai</h1>
            <p className="text-[11px] text-slate-600 mt-0.5 tracking-wide">Análisis de contratos · Habeas Data Colombia</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* ── Hero ── */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-950/40 border border-blue-800/40 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Powered by Gemini Vision + Claude
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-slate-50 mb-5 leading-tight">
            ¿Tu contrato autoriza<br />
            reportes a{' '}
            <span className="text-blue-400 italic">centrales de riesgo</span>?
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            Sube uno o varios contratos en PDF. En segundos sabrás si cumplen con la{' '}
            <span className="text-slate-300">Ley 1581 de 2012</span> y la{' '}
            <span className="text-slate-300">Ley 1266 de 2008</span>.
          </p>
        </div>

        {/* ── Upload zone ── */}
        {!isLoading && (
          <div className="space-y-5">
            <FileUpload files={files} onChange={setFiles} />

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-950/30 border border-red-800/50 px-4 py-3 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    onClick={() => onResults(MOCK_RESULTS)}
                    className="text-xs text-red-500 hover:text-red-300 mt-1 underline"
                  >
                    Ver demo con datos de ejemplo →
                  </button>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="space-y-3 pt-1">
              <button
                disabled={files.length === 0}
                onClick={handleAnalyze}
                className="
                  w-full py-4 rounded-xl font-semibold text-base transition-all duration-150
                  flex items-center justify-center gap-2
                  bg-blue-600 hover:bg-blue-500 text-white
                  disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed
                "
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {files.length > 0
                  ? `Analizar ${files.length} documento${files.length > 1 ? 's' : ''}`
                  : 'Selecciona documentos para analizar'}
              </button>

              <button
                onClick={() => onResults(MOCK_RESULTS)}
                className="
                  w-full py-3 rounded-xl text-sm font-medium transition-all duration-150
                  border border-slate-700/80 text-slate-500
                  hover:border-slate-500 hover:text-slate-300
                "
              >
                Ver demo con 5 documentos de ejemplo →
              </button>
            </div>
          </div>
        )}

        {/* ── Loading state ── */}
        {isLoading && (
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-10">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-slate-400">{stage}</span>
                <span className="text-sm font-semibold tabular-nums text-slate-200">{progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-[1400ms] ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 text-center">
              {/* Animated dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
              <p className="text-slate-500 text-sm">
                Procesando{' '}
                <span className="text-slate-300 font-medium">
                  {files.length} documento{files.length > 1 ? 's' : ''}
                </span>{' '}
                en paralelo...
              </p>
            </div>
          </div>
        )}

        {/* ── Legal footer ── */}
        <p className="mt-14 text-center text-[11px] text-slate-700 tracking-wide">
          Marco legal: Ley 1581 de 2012 · Decreto 1377 de 2013 · Ley 1266 de 2008 · SIC Colombia
        </p>
      </main>
    </div>
  )
}
