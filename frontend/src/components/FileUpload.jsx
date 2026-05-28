import { useRef, useCallback, useState } from 'react'

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export default function FileUpload({ files, onChange }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const addFiles = useCallback(
    (incoming) => {
      const pdfs = Array.from(incoming).filter(
        (f) => f.type === 'application/pdf' || f.name.endsWith('.pdf')
      )
      onChange((prev) => {
        const existing = new Set(prev.map((f) => f.name))
        return [...prev, ...pdfs.filter((f) => !existing.has(f.name))]
      })
    },
    [onChange]
  )

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  const remove = (name) =>
    onChange((prev) => prev.filter((f) => f.name !== name))

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative cursor-pointer select-none rounded-2xl border-2 border-dashed
          py-16 px-8 text-center transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-950/20 scale-[1.01]'
            : 'border-slate-700 bg-slate-900/30 hover:border-slate-500 hover:bg-slate-900/50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
              isDragging ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <svg
              className="w-8 h-8 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-slate-200 font-semibold text-lg">
              {isDragging ? 'Suelta los archivos aquí' : 'Arrastra tus contratos PDF aquí'}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              o{' '}
              <span className="text-blue-400 hover:text-blue-300">
                haz clic para seleccionar
              </span>
            </p>
          </div>
          <span className="text-xs text-slate-600 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50">
            Solo archivos .pdf · Múltiples archivos permitidos
          </span>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between bg-slate-900/60 rounded-xl px-4 py-3 border border-slate-700/40"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 shrink-0 bg-red-950/50 rounded-lg border border-red-900/40 flex items-center justify-center">
                  <span className="text-red-400 text-[10px] font-bold tracking-wider">PDF</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">{f.name}</p>
                  <p className="text-xs text-slate-600">{formatBytes(f.size)}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  remove(f.name)
                }}
                className="ml-3 shrink-0 p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                aria-label={`Quitar ${f.name}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
