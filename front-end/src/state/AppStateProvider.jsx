import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getProgress, getWords, resetProgress, startSession, updateUser } from '../lib/api.js'
import { makeRound, shuffle } from '../lib/rounds.js'
import { AppStateContext } from './context.js'

// All app state lives here; words and progress are loaded from Supabase on sign-in. A refresh clears it (back to Welcome).
export function AppStateProvider({ children }) {
  const [user, setUser] = useState(null)              // { name, email } once signed in
  const [words, setWords] = useState([])              // all HSK 1 words from the database, shuffled once per session
  const [matched, setMatched] = useState(() => new Set())   // ids of matched words
  const [round, setRound] = useState(null)            // { ids, left, right } — the 6 words on screen + column orders

  // Latest words/matched for callbacks created earlier (e.g. a toast button) so they never read stale state.
  const latest = useRef({ words: [], matched: new Set() })
  useEffect(() => { latest.current = { words, matched } }, [words, matched])

  // Fresh game: reshuffle all words, clear progress, deal the first set.
  const deal = useCallback((all, done) => {
    const shuffled = shuffle(all)
    setWords(shuffled)
    setMatched(done)
    setRound(makeRound(shuffled, done))
  }, [])

  // "Play again": clear saved progress (best effort), then start over.
  const restart = useCallback(async () => {
    try { await resetProgress() } catch (err) { console.error('Could not reset progress', err) }
    deal(latest.current.words, new Set())
  }, [deal])

  // Save the typed details, load words and progress, make sure a session is open, then start playing.
  // Throws if anything fails (Welcome shows the error).
  const signIn = useCallback(async (nextUser) => {
    await updateUser({ name: nextUser.name, email: nextUser.email })
    const all = await getWords()
    let done = new Set(await getProgress())
    if (all.length > 0 && done.size >= all.length) {   // already finished: start a fresh game so the player isn't stuck
      await resetProgress()
      done = new Set()
    } else {
      await startSession()
    }
    deal(all, done)
    setUser(nextUser)
  }, [deal])

  // Deal the next set of unmatched words.
  const nextRound = useCallback(() => {
    const { words: w, matched: m } = latest.current
    setRound(makeRound(w, m))
  }, [])

  const getWord = useCallback((id) => words.find((w) => w.id === id), [words])

  const value = useMemo(
    () => ({ user, signIn, restart, nextRound, words, matched, setMatched, round, total: words.length, getWord }),
    [user, signIn, restart, nextRound, words, matched, round, getWord],
  )
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}
