import { Navigate, Route, Routes } from 'react-router-dom'
import GuestOnly from './components/GuestOnly.jsx'
import Layout from './components/Layout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import RequireGame from './components/RequireGame.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Welcome from './pages/Welcome.jsx'
import Play from './pages/Play.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Welcome />} />
        <Route element={<RequireGame />}>
          <Route element={<Layout />}>
            <Route path="play" element={<Play />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
