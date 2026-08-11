import React, { useState } from 'react'
import DocumentActionMenu from './DocumentActionMenu'

interface DocumentItemProps {
  doc: {
    name: string
    size?: number
    [key: string]: any
  }
  onDelete?: (name: string) => void
  onSelect?: (name: string) => void
  onPreview?: (doc: any) => void
  onRename?: (name: string) => void
  onReindex?: (name: string) => void
}

export default function DocumentItem({
  doc,
  onDelete,
  onSelect,
  onPreview,
  onRename,
  onReindex,
}: DocumentItemProps) {
  const sizeKB = Math.round((doc.size || 0) / 1024)
  const name = doc.name
  const [hover, setHover] = useState(false)

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all duration-150 focus:outline-none ${
        hover ? 'translate-y-0.5 border-cyan-500/50' : 'border-slate-800'
      } bg-slate-900/80 text-slate-100 hover:bg-slate-800/80`}
      role="button"
      onClick={() => onSelect && onSelect(name)}
      title={name}
      tabIndex={0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/90 text-cyan-400">
          📄
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold text-slate-100">
            {name}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">
            {sizeKB} KB • <span className="text-emerald-400 font-medium">Ready</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete && onDelete(name)
          }}
          className="rounded p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          aria-label={`Delete ${name}`}
          title="Delete document"
        >
          🗑️
        </button>
        <DocumentActionMenu
          onPreview={() => onPreview && onPreview(doc)}
          onRename={() => onRename && onRename(name)}
          onReindex={() => onReindex && onReindex(name)}
          onDelete={() => onDelete && onDelete(name)}
        />
      </div>
    </div>
  )
}