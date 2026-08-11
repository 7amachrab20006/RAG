import React, { useState, useRef, useEffect } from 'react'
import { sendQuestion } from '../services/chatService'
import ReactMarkdown from 'react-markdown'
import ChatHistory from './ChatHistory'

function uid() { return Math.random().toString(36).slice(2,9) }

export default function ChatPanel() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPhase, setLoadingPhase] = useState<number>(0)
  const [showHistory, setShowHistory] = useState(false)
  const [conversations, setConversations] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('conversations') || '[]') } catch { return [] } })
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(()=>{ localStorage.setItem('conversations', JSON.stringify(conversations)) }, [conversations])

  function saveConversation(title?: string) {
    const id = activeConvId || uid()
    const convTitle = title || (messages.find(m=>m.role==='user')?.text?.slice(0,60) || 'Conversation')
    const now = new Date().toISOString()
    const conv = { id, title: convTitle, createdAt: now, updatedAt: now, messages }
    setConversations((c:any)=>{
      const rest = c.filter((x:any)=>x.id !== id)
      return [conv, ...rest]
    })
    setActiveConvId(id)
  }

  async function sendText(text: string) {
    if (!text || !text.trim()) return
    const userMsg = { role: 'user', text, ts: new Date().toISOString() }
    setMessages((m) => [...m, userMsg])
    setLoading(true)
    setLoadingPhase(1)

    const phaseTimer = setInterval(()=>{
      setLoadingPhase((p)=> (p<4 ? p+1 : 4))
    }, 700)

    try {
      const res = await sendQuestion(text)
      const ai = { role: 'ai', text: res.answer, ts: new Date().toISOString(), sources: res.sources }
      setMessages((m) => [...m, ai])
      saveConversation()
    } catch (e) {
      const err = { role: 'system', text: 'Error: could not fetch response', ts: new Date().toISOString() }
      setMessages((m) => [...m, err])
    } finally {
      clearInterval(phaseTimer)
      setLoading(false)
      setLoadingPhase(0)
      setQuestion('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }

  function handleSendFromComposer() {
    sendText(question)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendFromComposer()
    }
  }

  function handleCopy(text: string) {
    try { navigator.clipboard.writeText(text); alert('Copied to clipboard') } catch { alert('Copy failed') }
  }

  function handleRegenerate(aiIndex:number) {
    const slice = messages.slice(0, aiIndex).reverse()
    const user = slice.find((m:any)=>m.role==='user')
    if (user) sendText(user.text)
    else alert('No user message to regenerate')
  }

  function handleNewConversation() {
    setMessages([])
    setActiveConvId(null)
  }

  function handleHistorySelect(id:string) {
    const conv = conversations.find((c:any)=>c.id===id)
    if (conv) {
      setMessages(conv.messages || [])
      setActiveConvId(id)
    }
  }

  function handleHistoryRename(id:string) {
    const newTitle = window.prompt('Rename conversation')
    if (!newTitle) return
    setConversations((c:any)=>c.map((x:any)=> x.id===id ? {...x, title:newTitle} : x))
  }

  function handleHistoryDelete(id:string) {
    if (!window.confirm('Delete conversation?')) return
    setConversations((c:any)=>c.filter((x:any)=>x.id!==id))
    if (activeConvId===id) { setMessages([]); setActiveConvId(null) }
  }

  const suggested = [
    'Summarize my documents',
    'Explain the main concepts',
    'What are the most important topics?',
    'Create revision notes',
    'Compare these documents',
    'Quiz me on this content'
  ]

  return (
    <div className="flex h-full w-full flex-col justify-between p-4 overflow-hidden">
      <div className="flex flex-1 items-stretch gap-4 min-h-0">
        
        {/* Sidebar History (si activé) */}
        {showHistory && (
          <div className="w-64 shrink-0 hidden md:block overflow-y-auto border-r border-slate-800 pr-3">
            <div className="rounded-md p-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="text-sm font-semibold text-slate-100">History</div>
                <button onClick={()=>setShowHistory(false)} className="text-xs text-slate-400 hover:text-slate-200">Hide</button>
              </div>
              <div className="mt-3">
                <ChatHistory conversations={conversations} activeId={activeConvId || undefined} onSelect={handleHistorySelect} onNew={()=>{handleNewConversation(); setShowHistory(false)}} onRename={handleHistoryRename} onDelete={handleHistoryDelete} />
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Container */}
        <div className="flex flex-1 flex-col justify-between min-h-0 w-full">
          
          {/* Top Bar for History Toggle */}
          {!showHistory && (
            <div className="flex justify-end pb-2">
              <button onClick={()=>setShowHistory(true)} className="text-xs text-slate-400 hover:text-cyan-400 transition-colors">
                📜 Show History
              </button>
            </div>
          )}

          {/* Messages Area (Occupies full middle height and scrolls) */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-950/40 p-8 text-center text-sm text-slate-300">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-inner">
                  <svg className="h-10 w-10 text-cyan-400 animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 22v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 12h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-lg font-semibold text-slate-100">Your documents, now conversational</div>
                <p className="mt-2 text-sm text-slate-400 max-w-md">Ask questions, summarize content, extract insights, or study directly from your knowledge base.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl">
                  {suggested.map((s)=> (
                    <button key={s} onClick={()=>sendText(s)} className="rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-all shadow-sm">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`fade-in visible rounded-2xl border p-4 ${m.role === 'user' ? 'border-cyan-500/30 bg-cyan-500/10 text-slate-100' : m.role === 'ai' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-rose-500/30 bg-rose-500/10 text-slate-100'}`}>
                  <div className="flex items-start justify-between">
                    <div className="text-sm leading-6">
                      <ReactMarkdown>{m.text || ''}</ReactMarkdown>
                    </div>
                    {m.role === 'ai' && (
                      <div className="ml-4 flex flex-col items-end gap-2 text-xs text-slate-400">
                        <div className="flex gap-2">
                          <button onClick={()=>handleCopy(m.text)} title="Copy" className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors">Copy</button>
                          <button onClick={()=>handleRegenerate(i)} title="Regenerate" className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors">Regenerate</button>
                          <button title="Helpful" className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700">👍</button>
                          <button title="Not helpful" className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700">👎</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {m.sources && m.sources.length > 0 && (
                    <details className="mt-3 text-xs text-slate-400">
                      <summary className="cursor-pointer font-medium text-slate-300 hover:text-cyan-400 transition-colors">Sources ({m.sources.length})</summary>
                      <ul className="mt-2 space-y-2">
                        {m.sources.map((s: any, idx: number) => (
                          <li key={idx} className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-400">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-slate-200">{s.metadata?.source || s.source || 'Document'}</div>
                                <div className="text-xs text-slate-500">Page {s.metadata?.page || s.page || '-' } · Relevance {Math.round((s.score||0)*100)}%</div>
                              </div>
                              <div>
                                <button onClick={()=>{ const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/uploads/${encodeURIComponent(s.metadata?.source || s.source || '')}`; window.open(url,'_blank') }} className="text-xs text-cyan-400 hover:underline">Open</button>
                              </div>
                            </div>
                            <div className="mt-2 text-slate-400 line-clamp-3">{s.page_content}</div>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Bottom Input Area pinned at the end */}
          <div className="mt-auto pt-3 border-t border-slate-800/80 shrink-0">
            <div className="text-xs text-slate-500 mb-2 px-1">Answers are generated from your indexed documents.</div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-2 focus-within:border-cyan-500/50 transition-colors shadow-lg">
              <textarea 
                ref={textareaRef} 
                value={question} 
                onChange={(e)=>{ 
                  setQuestion(e.target.value); 
                  e.currentTarget.style.height = 'auto'; 
                  e.currentTarget.style.height = `${Math.min(120, e.currentTarget.scrollHeight)}px` 
                }} 
                onKeyDown={handleKeyDown} 
                placeholder="Ask anything about your documents..." 
                rows={1}
                className="flex-1 bg-transparent px-2 py-1 text-sm text-slate-100 placeholder:text-slate-500 resize-none focus:outline-none min-h-[38px] max-h-[120px]" 
              />
              <button 
                onClick={handleSendFromComposer} 
                disabled={loading || !question.trim()} 
                className="rounded-lg bg-cyan-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shrink-0"
              >
                {loading ? 'Thinking...' : 'Send'}
              </button>
            </div>

            {loading && (
              <div className="mt-2 text-xs text-cyan-400 animate-pulse px-1">
                {loadingPhase === 1 && 'Searching knowledge base...'}
                {loadingPhase === 2 && 'Retrieving relevant passages...'}
                {loadingPhase === 3 && 'Analyzing context...'}
                {loadingPhase >= 4 && 'Generating answer...'}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}