import { Outlet } from 'react-router-dom'
import { APP_NAME } from '../config/app.js'
import { LEVEL_COUNT } from '../data/hsk1.js'
import { useAppState } from '../state/useAppState.js'
import { ToastProvider } from '../toast/ToastProvider.jsx'

export default function Layout() {
  const { user, round } = useAppState()
  return (
    <ToastProvider>
      <header className="topbar">
        <p className="greeting">Hi, {user.name}</p>
        <p className="wordmark">{APP_NAME}</p>
        <p className="level-label">{round ? `Level ${round.level} of ${LEVEL_COUNT}` : ''}</p>
      </header>
      <Outlet />
    </ToastProvider>
  )
}
