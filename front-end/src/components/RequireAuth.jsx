import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AppStateProvider } from '../state/AppStateProvider.jsx'
import { useAuth } from '../state/useAuth.js'

// Every page inside this route needs a logged-in user; anyone else goes to Log in (and comes back after).
// The game state is keyed by user id, so logging out or switching accounts throws the previous user's game away.
export default function RequireAuth() {
  const { user, checking } = useAuth()
  const location = useLocation()

  if (checking) return <main className="welcome"><p className="muted" role="status">Checking your session…</p></main>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return (
    <AppStateProvider key={user.id}>
      <Outlet />
    </AppStateProvider>
  )
}
