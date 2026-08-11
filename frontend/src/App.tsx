import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'
import TopHeader from './components/TopHeader'
import { DocsProvider } from './context/DocsContext'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return true
  })

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    const root = document.documentElement
    if (next) root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <DocsProvider>
      <div className="flex h-screen w-screen flex-col bg-slate-950 text-slate-100 transition-colors duration-200 overflow-hidden">
        {/* Header en haut */}
        <TopHeader onToggleTheme={toggleDarkMode} dark={darkMode} />

        {/* Main Workspace: Pleine largeur (w-full / no max-w) */}
        <main className="flex-1 w-full h-[calc(100vh-4rem)] p-4 overflow-hidden">
          <Dashboard />
        </main>
      </div>
    </DocsProvider>
  )
}