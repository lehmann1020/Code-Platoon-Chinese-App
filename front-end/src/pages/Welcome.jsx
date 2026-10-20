import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_NAME } from '../config/app.js'
import { useAppState } from '../state/useAppState.js'
import { useAuth } from '../state/useAuth.js'

// Shown after logging in, before the game (and its header). Start loads the user's saved progress.
export default function Welcome() {
  const { displayName, signOut } = useAuth()
  const { loadGame } = useAppState()
  const navigate = useNavigate()
  const [busy, setBusy] = useState('')        // '' | 'start' | 'logout'
  const [formError, setFormError] = useState('')

  async function start() {
    setBusy('start')
    setFormError('')
    try {
      await loadGame()
      navigate('/play')
    } catch {
      setFormError('Could not connect. Please try again.')
      setBusy('')
    }
  }

  // RequireAuth sends us to Log in once the user is gone.
  async function logOut() {
    setBusy('logout')
    setFormError('')
    try {
      await signOut()
    } catch {
      setFormError('You were not logged out. Please try again.')
      setBusy('')
    }
  }

  return (
    <main className="welcome">
      <span className="seal" aria-hidden="true">汉</span>
      <h1>Welcome, {displayName}</h1>
      <p className="welcome-sub">Learn HSK 1 vocabulary by matching characters to their pinyin. {APP_NAME} saves your progress as you go.</p>
      <button type="button" className="btn btn-primary welcome-start" autoFocus onClick={start} disabled={!!busy}>
        {busy === 'start' ? 'Loading…' : 'Start matching'}
      </button>
      <small className="error" role={formError ? 'alert' : undefined}>{formError}</small>
      <p className="auth-switch">Not you? <button type="button" className="link-btn" onClick={logOut} disabled={!!busy}>Log out</button></p>
    </main>
  )
}
