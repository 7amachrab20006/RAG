import React, { useState } from 'react'

export default function DocumentActionMenu({ onPreview, onRename, onReindex, onDelete }: { onPreview: () => void; onRename: () => void; onReindex: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={(e) => { e.stopPropagation(); setOpen((s) => !s) }} className="px-2 py-1 text-sm text-slate-300 hover:bg-slate-800/50 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500">⋯</button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-md border border-slate-800 bg-slate-900 p-2 shadow-md z-10">
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); onPreview() }} className="w-full text-left px-2 py-1 text-sm text-slate-200 hover:bg-slate-800 rounded">Preview</button>
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); onRename() }} className="w-full text-left px-2 py-1 text-sm text-slate-200 hover:bg-slate-800 rounded">Rename</button>
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); onReindex() }} className="w-full text-left px-2 py-1 text-sm text-slate-200 hover:bg-slate-800 rounded">Re-index</button>
          <button onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete() }} className="w-full text-left px-2 py-1 text-sm text-rose-400 hover:bg-slate-800 rounded">Delete</button>
        </div>
      )}
    </div>
  )
}
