import React from 'react'
import { useDocs } from '../context/DocsContext'

export default function TopHeader({ onToggleTheme, dark = true }: { onToggleTheme?: () => void; dark?: boolean }) {
  const { docsCount } = useDocs()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-md bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12h18" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 3v18" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">RAG Workspace</div>
            <div className="text-xs text-slate-400">Knowledge Base Active</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 rounded border border-slate-800 bg-slate-900/60 px-3 py-1 text-sm text-slate-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12h18" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 3v18" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="text-xs text-slate-300">{docsCount} documents</div>
          </div>

          <button onClick={onToggleTheme} aria-label="Toggle theme" className="rounded px-2 py-1 text-slate-200 hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500">{dark ? '☀️' : '🌙'}</button>

          <button aria-label="Settings" className="rounded px-2 py-1 text-slate-200 hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500">⚙️</button>
          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-200">JS</div>
        </div>
      </div>
    </header>
  )
}
