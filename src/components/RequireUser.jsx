import { Navigate, Outlet } from 'react-router-dom'
import { useAppState } from '../state/useAppState.js'

// Route guard: /play needs a signed-in learner. A refresh clears state, so it lands back on the welcome screen.
export default function RequireUser() {
  const { user } = useAppState()
  return user ? <Outlet /> : <Navigate to="/" replace />
}
