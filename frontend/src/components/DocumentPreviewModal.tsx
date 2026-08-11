import React from 'react'

interface DocumentPreviewModalProps {
  doc: { name: string; size?: number; [key: string]: any } | null
  onClose: () => void
}

export default function DocumentPreviewModal({ doc, onClose }: DocumentPreviewModalProps) {
  if (!doc) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Document Preview: {doc.name}
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="my-6 max-h-96 overflow-y-auto rounded-lg bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-700 dark:text-slate-300">
          <p className="font-mono text-xs text-slate-500 mb-2">
            File name: {doc.name} | Size: {Math.round((doc.size || 0) / 1024)} KB
          </p>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            <p className="italic text-slate-500">
              Previewing raw text contents from indexed vector chunks...
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}