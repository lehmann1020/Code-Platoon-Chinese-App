import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { APP_NAME } from '../config/app.js'
import { LEVEL_COUNT } from '../data/hsk1.js'
import { useAppState } from '../state/useAppState.js'
import { useAuth } from '../state/useAuth.js'
import { ToastProvider } from '../toast/ToastProvider.jsx'

export default function Layout() {
  const { round } = useAppState()
  const { displayName, user, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  // RequireAuth sends us to Log in once the user is gone.
  async function onSignOut() {
    setSigningOut(true)
    setSignOutError('')
    try {
      await signOut()
    } catch {
      setSignOutError('You were not logged out. Please try again.')
      setSigningOut(false)
    }
  }

  return (
    <ToastProvider>
      <header className="topbar">
        <p className="greeting" title={user?.email}>Hi, {displayName}</p>
        <p className="wordmark">{APP_NAME}</p>
        <div className="topbar-end">
          <p className="level-label">{round ? `Level ${round.level} of ${LEVEL_COUNT}` : ''}</p>
          <button type="button" className="btn btn-small" onClick={onSignOut} disabled={signingOut}>
            {signingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </header>
      {signOutError && <p className="error center" role="alert">{signOutError}</p>}
      <Outlet />
    </ToastProvider>
  )
}
