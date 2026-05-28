import React, { useState } from 'react'
import ResultCard from '../components/ResultCard'
import RiskBadge from '../components/RiskBadge'
import { exportExcel } from '../services/api'

function ConfidenceBar({ value }) {
  const color =
    value >= 80 ? 'from-emerald-500 to-emerald-400'
    : value >= 60 ? 'from-amber-500 to-amber-400'
    : 'from-red-500 to-red-400'
  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="w-14 h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-slate-500">{value}%</span>
    </div>
  )
}

function BoolCell({ value }) {
  return value ? (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-950/60 border border-emerald-800/50">
      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  ) : (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-950/60 border border-red-800/50">
      <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  )
}

export default function Dashboard({ results, onReset }) {
  const { resultados, resumen_global: s } = results
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState(null)
  const [expandedRow, setExpandedRow] = useState(null)

  const handleExport = async () => {
    setIsExporting(true)
    setExportError(null)
    try {
      const blob = await exportExcel(resultados)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `duedilig_reporte_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setExportError(`Error al exportar: ${err.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  const pctAlto  = s.total ? Math.round((s.alto  / s.total) * 100) : 0
  const pctMedio = s.total ? Math.round((s.medio / s.total) * 100) : 0

  const tableRows = []
  resultados.forEach((doc, i) => {
    const isExpanded = expandedRow === i
    tableRows.push(
      <tr
        key={doc.filename}
        onClick={() => setExpandedRow(isExpanded ? null : i)}
        className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors cursor-pointer"
      >
        {/* Documento */}
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 bg-red-950/40 rounded-lg border border-red-900/30 flex items-center justify-center">
              <span className="text-red-400 text-[10px] font-bold tracking-wider">PDF</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-200 font-medium truncate max-w-[180px]">{doc.filename}</p>
            </div>
          </div>
        </td>
        {/* Riesgo */}
        <td className="px-4 py-4 text-center">
          <RiskBadge level={doc.nivel_riesgo} />
        </td>
        {/* Autorización */}
        <td className="px-4 py-4 text-center">
          <BoolCell value={doc.tiene_autorizacion} />
        </td>
        {/* Centrales */}
        <td className="px-4 py-4 text-center">
          <BoolCell value={doc.menciona_centrales_riesgo} />
        </td>
        {/* Confianza */}
        <td className="px-4 py-4">
          <ConfidenceBar value={doc.confianza} />
        </td>
        {/* Resumen */}
        <td className="px-4 py-4">
          <p className="text-xs text-slate-500 line-clamp-2 max-w-xs leading-relaxed">{doc.resumen}</p>
        </td>
        {/* Expandir */}
        <td className="px-4 py-4 text-center">
          <svg
            className={`w-4 h-4 text-slate-600 transition-transform duration-200 mx-auto ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </td>
      </tr>
    )

    if (isExpanded) {
      tableRows.push(
        <tr key={`${doc.filename}-detail`} className="bg-slate-900/40 border-b border-slate-800/60">
          <td colSpan={7} className="px-8 py-6">
            <div className="grid grid-cols-1 gap-5 max-w-3xl">
              <div>
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">
                  Resumen completo
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">{doc.resumen}</p>
              </div>
              {doc.fragmento_relevante ? (
                <div>
                  <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">
                    Fragmento relevante del contrato
                  </p>
                  <blockquote className="text-sm text-slate-300 italic bg-slate-800/50 border-l-2 border-blue-500 pl-4 pr-4 py-3 rounded-r-xl leading-relaxed">
                    "{doc.fragmento_relevante}"
                  </blockquote>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No se encontró fragmento de cláusula de autorización en el documento.
                </div>
              )}
            </div>
          </td>
        </tr>
      )
    }
  })

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100">
      {/* ── Header ── */}
      <header className="border-b border-slate-800/80 px-6 py-4 sticky top-0 z-10 bg-[#080C14]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-slate-50 leading-none">duedilig-ai</h1>
              <p className="text-[11px] text-slate-600 mt-0.5 tracking-wide">Resultados del análisis</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {exportError && (
              <span className="text-xs text-red-400 max-w-xs truncate">{exportError}</span>
            )}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                bg-emerald-700 hover:bg-emerald-600 text-white
                disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isExporting ? 'Exportando...' : 'Exportar Excel'}
            </button>
            <button
              onClick={onReset}
              className="
                flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-sm font-medium
                text-slate-400 hover:text-slate-100 hover:border-slate-500 transition-all duration-150
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Nuevo análisis
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ResultCard
            label="Total documentos"
            value={s.total}
            sub={`${s.errores > 0 ? `${s.errores} error${s.errores > 1 ? 'es' : ''} · ` : ''}todos procesados`}
            color="blue"
          />
          <ResultCard
            label="Riesgo ALTO"
            value={s.alto}
            sub={`${pctAlto}% del total · sin autorización`}
            color="red"
          />
          <ResultCard
            label="Riesgo MEDIO"
            value={s.medio}
            sub={`${pctMedio}% del total · autorización genérica`}
            color="amber"
          />
          <ResultCard
            label="Riesgo BAJO"
            value={s.bajo}
            sub={`${s.porcentaje_cumplimiento}% cumplimiento normativo`}
            color="emerald"
          />
        </div>

        {/* ── Compliance bar ── */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-300">Nivel de cumplimiento general</p>
            <span className="text-sm font-semibold text-slate-200 tabular-nums">
              {s.porcentaje_cumplimiento}%
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
            {s.alto > 0 && (
              <div
                className="h-full bg-red-500/80 transition-all duration-700"
                style={{ width: `${(s.alto / s.total) * 100}%` }}
                title={`ALTO: ${s.alto}`}
              />
            )}
            {s.medio > 0 && (
              <div
                className="h-full bg-amber-500/80 transition-all duration-700"
                style={{ width: `${(s.medio / s.total) * 100}%` }}
                title={`MEDIO: ${s.medio}`}
              />
            )}
            {s.bajo > 0 && (
              <div
                className="h-full bg-emerald-500/80 transition-all duration-700"
                style={{ width: `${(s.bajo / s.total) * 100}%` }}
                title={`BAJO: ${s.bajo}`}
              />
            )}
          </div>
          <div className="flex gap-5 mt-3">
            {[
              { color: 'bg-red-500/80',     label: 'ALTO'  },
              { color: 'bg-amber-500/80',   label: 'MEDIO' },
              { color: 'bg-emerald-500/80', label: 'BAJO'  },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Results table ── */}
        <div className="rounded-2xl border border-slate-800/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/40">
            <h3 className="font-display text-lg font-semibold text-slate-100">
              Resultados por documento
            </h3>
            <span className="text-xs text-slate-600 bg-slate-800 px-3 py-1 rounded-full border border-slate-700/50">
              {resultados.length} documento{resultados.length !== 1 ? 's' : ''} · Haz clic para expandir
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/60">
                  {[
                    ['Documento',           'text-left px-5 py-3'],
                    ['Riesgo',              'text-center px-4 py-3'],
                    ['Autorización',        'text-center px-4 py-3'],
                    ['Centrales',           'text-center px-4 py-3'],
                    ['Confianza',           'text-center px-4 py-3'],
                    ['Resumen',             'text-left px-4 py-3'],
                    ['',                    'text-center px-4 py-3 w-8'],
                  ].map(([label, cls]) => (
                    <th
                      key={label}
                      className={`${cls} text-[10px] font-semibold text-slate-600 uppercase tracking-widest`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{tableRows}</tbody>
            </table>
          </div>
        </div>

        {/* ── Legal footer ── */}
        <p className="text-center text-[11px] text-slate-700 tracking-wide pb-4">
          Marco legal: Ley 1581 de 2012 · Decreto 1377 de 2013 · Ley 1266 de 2008 · SIC Colombia
        </p>
      </main>
    </div>
  )
}
