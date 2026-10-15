import { useMemo, useState } from 'react'
import { AppStateContext } from './context.js'

// All app state lives here, in memory. A refresh resets it (no API, no storage).
// Later phases add: shuffled words, current set, matched ids.
export function AppStateProvider({ children }) {
  const [user, setUser] = useState(null)   // { name, email } once signed in

  const value = useMemo(() => ({ user, setUser }), [user])
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
