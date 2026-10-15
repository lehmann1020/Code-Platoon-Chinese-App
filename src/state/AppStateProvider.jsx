import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WORDS } from '../data/hsk1.js'
import { makeRound, shuffle } from '../lib/rounds.js'
import { AppStateContext } from './context.js'

// All app state lives here, in memory. A refresh resets it (no API, no storage).
export function AppStateProvider({ children }) {
  const [user, setUser] = useState(null)              // { name, email } once signed in
  const [words, setWords] = useState([])              // all HSK 1 words, shuffled once per session
  const [matched, setMatched] = useState(() => new Set())   // ids of matched words
  const [round, setRound] = useState(null)            // { ids, left, right } — the 6 words on screen + column orders

  // Latest words/matched for callbacks created earlier (e.g. a toast button) so they never read stale state.
  const latest = useRef({ words: [], matched: new Set() })
  useEffect(() => { latest.current = { words, matched } }, [words, matched])

  // Start (or restart) a fresh game: reshuffle all words, clear progress, deal the first set.
  const restart = useCallback(() => {
    const shuffled = shuffle(WORDS)
    const none = new Set()
    setWords(shuffled)
    setMatched(none)
    setRound(makeRound(shuffled, none))
  }, [])

  const signIn = useCallback((nextUser) => {
    setUser(nextUser)
    restart()
  }, [restart])

  // Deal the next set of unmatched words.
  const nextRound = useCallback(() => {
    const { words: w, matched: m } = latest.current
    setRound(makeRound(w, m))
  }, [])

  const value = useMemo(
    () => ({ user, signIn, restart, nextRound, words, matched, setMatched, round, total: WORDS.length }),
    [user, signIn, restart, nextRound, words, matched, round],
  )
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
