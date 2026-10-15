import { Outlet } from 'react-router-dom'
import { APP_NAME } from '../config/app.js'
import { useAppState } from '../state/useAppState.js'

export default function Layout() {
  const { user } = useAppState()
  return (
    <>
      <header className="topbar">
        <p className="greeting">Hi, {user.name}</p>
        <p className="wordmark">{APP_NAME}</p>
        <span aria-hidden="true" />
      </header>
      <Outlet />
    </>
  )
}
