import { useNavigate } from 'react-router-dom'
import { APP_NAME } from '../config/app.js'
import { useAppState } from '../state/useAppState.js'
import FontCheck from './FontCheck.jsx'

// Phase 0 placeholder. The real name + email form arrives in Phase 2.
export default function Welcome() {
  const { setUser } = useAppState()
  const navigate = useNavigate()
  return (
    <main className="page center">
      <h1>{APP_NAME}</h1>
      <p className="muted">Phase 0 scaffold. The name and email form comes in Phase 2.</p>
      <FontCheck />
      <button type="button" className="btn btn-primary" onClick={() => { setUser({ name: 'Dev', email: 'dev@example.com' }); navigate('/play') }}>
        Dev skip to /play (temporary)
      </button>
    </main>
  )
}
