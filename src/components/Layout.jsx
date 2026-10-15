import { Outlet } from 'react-router-dom'
import { APP_NAME } from '../config/app.js'
import { useAppState } from '../state/useAppState.js'
import { ToastProvider } from '../toast/ToastProvider.jsx'

export default function Layout() {
  const { user } = useAppState()
  return (
    <ToastProvider>
      <header className="topbar">
        <p className="greeting">Hi, {user.name}</p>
        <p className="wordmark">{APP_NAME}</p>
        <span aria-hidden="true" />
      </header>
      <Outlet />
    </ToastProvider>
  )
}
