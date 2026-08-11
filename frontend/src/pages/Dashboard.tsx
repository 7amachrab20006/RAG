import React, { useEffect, useState } from 'react'
import UploadPanel from '../components/UploadPanel'
import ChatPanel from '../components/ChatPanel'
import DocumentItem from '../components/DocumentItem'
import DocumentPreviewModal from '../components/DocumentPreviewModal'
import KBStats from '../components/KBStats'
import { listDocuments, deleteDocument } from '../services/documentService'
import { useDocs } from '../context/DocsContext'

export default function Dashboard() {
  const [docs, setDocs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [previewDoc, setPreviewDoc] = useState<any | null>(null)
  const { setDocsCount } = useDocs()

  useEffect(() => {
    fetchDocs()
  }, [])

  async function fetchDocs() {
    try {
      const res = await listDocuments()
      const list = res.documents || []
      setDocs(list)
      try {
        setDocsCount(list.length)
      } catch (err) {
        // ignore if context not available
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDelete(name: string) {
    const confirmed = window.confirm(
      `Delete document "${name}"? This will re-index the knowledge base.`
    )
    if (!confirmed) return
    try {
      await deleteDocument(name)
      await fetchDocs()
    } catch (e) {
      console.error(e)
      alert('Failed to delete document. See console for details.')
    }
  }

  async function handleRename(name: string) {
    const newName = window.prompt('Rename document', name)
    if (!newName || newName === name) return
    try {
      const res = await fetch(`/api/documents/rename/${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_name: newName }),
      })
      if (!res.ok) throw new Error('Not supported')
      await fetchDocs()
      alert('Renamed successfully')
    } catch (e) {
      alert(
        'Rename is not supported by the backend. To rename, please download and re-upload the file with the desired name.'
      )
    }
  }

  async function handleReindex(name: string) {
    try {
      const res = await fetch(`/api/documents/reindex/${encodeURIComponent(name)}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Reindex not supported')
      alert('Reindex triggered')
    } catch (e) {
      alert(
        'Re-index is not supported by the backend. Uploading/removing files triggers reindex automatically.'
      )
    }
  }

  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-full w-full gap-4 p-4 text-slate-100 overflow-hidden">
      {/* Sidebar: Left-hand Knowledge Base Controls */}
      <aside className="w-80 shrink-0 flex flex-col gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 overflow-y-auto shadow-lg">
        {/* Header Title */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h18" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3v18" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">Knowledge Base</div>
              <div className="text-xs text-slate-400">Your uploaded documents</div>
            </div>
          </div>
          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300 font-medium">
            {docs.length}
          </span>
        </div>

        {/* Knowledge Base Statistics */}
        <KBStats
          docs={docs.length}
          pages={Math.max(0, docs.length * 10)}
          chunks={Math.max(0, docs.length * 120)}
          updated="Just now"
        />

        {/* Drag & Drop / File Uploader */}
        <UploadPanel onUploaded={fetchDocs} />

        {/* Search & Document List */}
        <div className="flex flex-col gap-3 flex-1 min-h-0 pt-2">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 pl-8 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
            />
            <span className="absolute left-2.5 top-2.5 text-xs text-slate-500">🔍</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-center text-xs text-slate-400">
                {docs.length === 0
                  ? 'No documents yet — upload PDFs to start.'
                  : 'No documents match your search.'}
              </div>
            ) : (
              <ul className="space-y-2">
                {filtered.map((d) => (
                  <li key={d.name}>
                    <DocumentItem
                      doc={d}
                      onDelete={handleDelete}
                      onSelect={() => {}}
                      onPreview={(doc) => setPreviewDoc(doc)}
                      onRename={handleRename}
                      onReindex={handleReindex}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Document Preview Modal Component */}
        <DocumentPreviewModal
          open={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          doc={previewDoc}
        />
      </aside>

      {/* Main Container: Workspace élargi qui remplit tout l'espace à droite */}
      <main className="flex-1 h-full flex flex-col rounded-2xl border border-slate-800/80 bg-[#0b0f19] shadow-2xl overflow-hidden">
        <ChatPanel />
      </main>
    </div>
  )
} 