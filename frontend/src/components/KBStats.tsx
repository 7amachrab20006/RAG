import React from 'react'

export default function KBStats({ docs = 0, pages = 0, chunks = 0, updated = '—' }: { docs?: number; pages?: number; chunks?: number; updated?: string }) {
  return (
    <div className="mb-4 grid grid-cols-3 gap-3">
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-center">
        <div className="text-xs text-slate-400">Documents</div>
        <div className="mt-1 text-lg font-semibold text-slate-100">{docs}</div>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-center">
        <div className="text-xs text-slate-400">Pages</div>
        <div className="mt-1 text-lg font-semibold text-slate-100">{pages}</div>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-center">
        <div className="text-xs text-slate-400">Chunks</div>
        <div className="mt-1 text-lg font-semibold text-slate-100">{chunks}</div>
      </div>
    </div>
  )
}
