import React, { createContext, useContext, useState } from 'react'

type DocsContextType = {
  docsCount: number
  setDocsCount: (n: number) => void
}

const DocsContext = createContext<DocsContextType | undefined>(undefined)

export const DocsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [docsCount, setDocsCount] = useState(0)
  return <DocsContext.Provider value={{ docsCount, setDocsCount }}>{children}</DocsContext.Provider>
}

export function useDocs() {
  const ctx = useContext(DocsContext)
  if (!ctx) throw new Error('useDocs must be used within DocsProvider')
  return ctx
}
