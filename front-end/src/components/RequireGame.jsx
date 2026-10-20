import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAppState } from '../state/useAppState.js'

// /play needs the user's game loaded. Welcome loads it on Start; after a refresh on /play it is loaded here,
// so the user lands back on their own progress.
export default function RequireGame() {
  const { ready, loadGame } = useAppState()
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (ready) return
    let active = true
    loadGame().catch((err) => {
      console.error('Could not load your game', err)
      if (active) setFailed(true)
    })
    return () => { active = false }
  }, [ready, loadGame, attempt])

  if (ready) return <Outlet />
  if (failed) {
    return (
      <main className="page center">
        <p className="error" role="alert">Could not load your progress.</p>
        <button type="button" className="btn" onClick={() => { setFailed(false); setAttempt((n) => n + 1) }}>Try again</button>
      </main>
    )
  }
  return <main className="page center"><p className="muted" role="status">Loading your progress…</p></main>
}
