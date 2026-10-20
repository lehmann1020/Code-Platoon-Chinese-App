import { useCallback, useEffect, useMemo, useState } from 'react'
import * as api from '../lib/api.js'
import { AuthContext } from './authContext.js'

// Who is logged in. On first load it recovers the session saved in the browser (so a refresh keeps you
// logged in), then follows log in / log out / session-expired events from Supabase.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)         // the Supabase Auth user, or null
  const [name, setName] = useState('')           // from public.users (the trigger copied it from sign-up)
  const [checking, setChecking] = useState(true) // true until the saved session has been checked

  useEffect(() => {
    let active = true
    api.getCurrentUser()
      .then((u) => { if (active) setUser(u) })
      .catch(() => { if (active) setUser(null) })
      .finally(() => { if (active) setChecking(false) })
    const unsubscribe = api.onAuthChange((u) => { if (active) setUser(u) })
    return () => { active = false; unsubscribe() }
  }, [])

  // Load the user's name from their own users row; fall back to the sign-up metadata, then the email.
  const userId = user?.id
  useEffect(() => {
    if (!userId) return
    let active = true
    api.getProfile()
      .then((p) => { if (active && p?.name) setName(p.name) })
      .catch((err) => console.error('Could not load your profile', err))
    return () => { active = false }
  }, [userId])

  const signIn = useCallback(async (credentials) => { setUser(await api.signIn(credentials)) }, [])
  const signUp = useCallback(async (details) => { setUser(await api.signUp(details)) }, [])
  const signOut = useCallback(async () => {
    await api.signOut()
    setUser(null)
    setName('')
  }, [])

  const displayName = name || user?.user_metadata?.name || user?.email || ''
  const value = useMemo(
    () => ({ user, displayName, checking, signIn, signUp, signOut }),
    [user, displayName, checking, signIn, signUp, signOut],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
