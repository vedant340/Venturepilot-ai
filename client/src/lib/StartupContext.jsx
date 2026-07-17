import { createContext, useContext, useState } from 'react'

const StartupCtx = createContext(null)

const EMPTY = { name: '', description: '', industry: '', audience: '', problem: '' }

export function StartupProvider({ children }) {
  const [startup, setStartup] = useState(EMPTY)
  const isReady = Boolean(startup.name && startup.description)
  return (
    <StartupCtx.Provider value={{ startup, setStartup, isReady }}>
      {children}
    </StartupCtx.Provider>
  )
}

export function useStartup() {
  const ctx = useContext(StartupCtx)
  if (!ctx) throw new Error('useStartup must be used within StartupProvider')
  return ctx
}
