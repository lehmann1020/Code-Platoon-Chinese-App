import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)

// Reuse the saved anonymous session if there is one; otherwise create one.
// Returns the auth user, or throws with a readable message.
export async function ensureSession() {
  const { data: current } = await supabase.auth.getSession()
  if (current.session) return current.session.user
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.user
}
