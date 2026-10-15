import { useCallback, useMemo, useState } from 'react'
import { WORDS } from '../data/hsk1.js'
import { makeRound, shuffle } from '../lib/rounds.js'
import { AppStateContext } from './context.js'

// All app state lives here, in memory. A refresh resets it (no API, no storage).
export function AppStateProvider({ children }) {
  const [user, setUser] = useState(null)              // { name, email } once signed in
  const [words, setWords] = useState([])              // all HSK 1 words, shuffled once per session
  const [matched, setMatched] = useState(() => new Set())   // ids of matched words
  const [round, setRound] = useState(null)            // { ids, left, right } — the 6 words on screen + column orders

  // Sign in and start a fresh game.
  const signIn = useCallback((nextUser) => {
    const shuffled = shuffle(WORDS)
    const none = new Set()
    setUser(nextUser)
    setWords(shuffled)
    setMatched(none)
    setRound(makeRound(shuffled, none))
  }, [])

  const value = useMemo(
    () => ({ user, signIn, words, matched, setMatched, round, setRound, total: WORDS.length }),
    [user, signIn, words, matched, round],
  )
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
