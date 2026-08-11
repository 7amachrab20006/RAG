import React from 'react'

export type Conversation = {
  id: string
  title: string
  createdAt: string
  updatedAt?: string
}

export default function ChatHistory({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete
}: {
  conversations: Conversation[]
  activeId?: string
  onSelect: (id: string) => void
  onNew: () => void
  onRename: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-100">Chat History</div>
        <button onClick={onNew} className="text-xs text-cyan-400 hover:underline">+ New</button>
      </div>
      <div className="mt-3 space-y-2">
        {conversations.length === 0 && (
          <div className="text-xs text-slate-500">No conversations yet. Start a new chat.</div>
        )}
        {conversations.map((c) => (
          <div key={c.id} className={`flex items-center justify-between gap-3 rounded-md p-2 ${c.id === activeId ? 'bg-slate-800' : 'hover:bg-slate-900'} cursor-pointer`} onClick={() => onSelect(c.id)}>
            <div>
              <div className="text-sm text-slate-100 truncate" title={c.title}>{c.title}</div>
              <div className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); onRename(c.id) }} className="text-xs text-slate-300 hover:text-white">Rename</button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(c.id) }} className="text-xs text-rose-400 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
