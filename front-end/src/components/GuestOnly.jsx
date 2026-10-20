import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../state/useAuth.js'

// Log in and Register are only for logged-out visitors. A logged-in user (including one who just logged in here)
// goes back to the page that sent them to Log in, or to Welcome.
export default function GuestOnly() {
  const { user, checking } = useAuth()
  const location = useLocation()
  if (checking) return <main className="welcome"><p className="muted" role="status">Checking your session…</p></main>
  return user ? <Navigate to={location.state?.from ?? '/'} replace /> : <Outlet />
}
