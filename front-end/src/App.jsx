import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RequireUser from './components/RequireUser.jsx'
import Welcome from './pages/Welcome.jsx'
import Play from './pages/Play.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route element={<RequireUser />}>
        <Route element={<Layout />}>
          <Route path="play" element={<Play />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
