import React, { useRef, useState } from 'react'
import { uploadDocuments } from '../services/documentService'

export default function UploadPanel({ onUploaded }: { onUploaded?: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<File[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = Array.from(e.dataTransfer.files).filter((x) => x.type === 'application/pdf')
    setFiles(f)
  }

  function onChoose() {
    inputRef.current?.click()
  }

  async function onSubmit() {
    if (!files || files.length === 0) return
    setLoading(true)
    setMessage(null)
    try {
      await uploadDocuments(files, (p) => setProgress(p))
      setMessage('Upload successful')
      setFiles(null)
      onUploaded?.()
    } catch (e: any) {
      setMessage(e?.message || 'Upload failed')
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(null), 800)
    }
  }

  return (
    <div>
      <div
        className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className="text-sm text-slate-300">Drag & drop PDF files here</div>
        <div className="mt-3 flex items-center gap-2">
          <button onClick={onChoose} className="rounded bg-slate-700 px-3 py-1.5 text-white transition hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500">
            Choose files
          </button>
          <button onClick={onSubmit} disabled={loading || !files} className="rounded bg-cyan-600 px-3 py-1.5 text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500">
            {loading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
        <input ref={inputRef} type="file" accept="application/pdf" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="hidden" />
        {files && files.length > 0 && (
          <div className="mt-3 text-sm text-slate-400">{files.map((f) => f.name).join(', ')}</div>
        )}

        {progress !== null && (
          <div className="mt-3">
            <div className="h-2 w-full rounded bg-slate-800">
              <div className="h-2 rounded bg-cyan-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-1 text-xs text-slate-400">Processing: {progress}%</div>
          </div>
        )}

        {message && <div className="mt-2 text-sm text-slate-400">{message}</div>}
      </div>
    </div>
  )
}
