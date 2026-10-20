import { createClient } from '@supabase/supabase-js'

// Every Supabase call lives here. Publishable key only.
// supabase-js keeps the logged-in session in localStorage (so a refresh stays logged in), refreshes the token,
// and sends the user's access token with every table request. The database fills in every user_id from that
// token (default auth.uid()) and RLS limits each user to their own rows, so the app never sends a user id.
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)

const slugToUuid = new Map()   // 'hsk1-001' -> words.id (user_words.word_id is the uuid)
const uuidToSlug = new Map()
let session = null             // { id, startedAt } of the open game_sessions row

function check({ data, error }) {
  if (error) throw error
  return data
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

// Register. `name` goes in the sign-up metadata; the on_auth_user_created trigger copies it into public.users.
export async function signUp({ name, email, password }) {
  const { session: s } = check(await supabase.auth.signUp({ email, password, options: { data: { name } } }))
  // With "Confirm email" on, Supabase returns a user but no session.
  if (!s) throw new Error('Check your email to confirm your account, then log in.')
  return s.user
}

export async function signIn({ email, password }) {
  return check(await supabase.auth.signInWithPassword({ email, password })).user
}

// Ends the session and removes the stored tokens from this browser.
export async function signOut() {
  session = null
  check(await supabase.auth.signOut())
}

// Recovers the session saved in this browser (e.g. after a refresh), then confirms it with Supabase.
// Returns the user, or null if nobody is logged in or the saved session is no longer valid.
export async function getCurrentUser() {
  const { data: { session: s } } = await supabase.auth.getSession()
  if (!s) return null
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    await supabase.auth.signOut({ scope: 'local' })
    return null
  }
  return data.user
}

// Calls `callback(user | null)` when the user logs in, logs out, or the session ends. Returns an unsubscribe function.
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, s) => {
    if (event === 'INITIAL_SESSION') return   // getCurrentUser() handles the first load
    // Defer: supabase-js warns against awaiting other Supabase calls inside this callback.
    setTimeout(() => callback(s?.user ?? null), 0)
  })
  return () => data.subscription.unsubscribe()
}

// The logged-in user's row in public.users (RLS returns only their own).
export async function getProfile() {
  return check(await supabase.from('users').select('name,email').maybeSingle())
}

// ---------------------------------------------------------------------------
// Game data
// ---------------------------------------------------------------------------

// All words, in slug order. The app uses the slug as each word's id.
export async function getWords() {
  const rows = check(await supabase.from('words').select('slug,id,hanzi,pinyin,english,level').order('slug'))
  slugToUuid.clear()
  uuidToSlug.clear()
  return rows.map(({ slug, id, hanzi, pinyin, english, level }) => {
    slugToUuid.set(slug, id)
    uuidToSlug.set(id, slug)
    return { id: slug, hanzi, pinyin, english, level }
  })
}

// Slugs of the words the user has matched. Call getWords first.
export async function getProgress() {
  const rows = check(await supabase.from('user_words').select('word_id'))
  return rows.map((r) => uuidToSlug.get(r.word_id)).filter(Boolean)
}

// A duplicate (23505) means it was already saved, which is fine.
export async function saveMatch(slug) {
  const { error } = await supabase.from('user_words').insert({ word_id: slugToUuid.get(slug) })
  if (error && error.code !== '23505') throw error
}

// Reuse the latest open session, otherwise start a new one.
export async function startSession() {
  const open = check(await supabase.from('game_sessions').select('id,started_at')
    .is('completed_at', null).order('started_at', { ascending: false }).limit(1))
  const row = open[0] ?? check(await supabase.from('game_sessions').insert({}).select('id,started_at').single())
  session = { id: row.id, startedAt: row.started_at }
}

// completed_at must not be before the server's started_at, so never trust a slow client clock.
export async function finishSession() {
  if (!session) await startSession()
  const completedAt = new Date(Math.max(Date.now(), new Date(session.startedAt).getTime())).toISOString()
  check(await supabase.from('game_sessions').update({ completed_at: completedAt }).eq('id', session.id).select('id'))
  session = null
}

// "Play again": forget all of this user's matches and begin a new session.
// A delete must be filtered; the id comes from the session token (RLS would stop any other id anyway).
export async function resetProgress() {
  const { data: { session: s } } = await supabase.auth.getSession()
  check(await supabase.from('user_words').delete().eq('user_id', s?.user.id).select('word_id'))
  session = null
  await startSession()
}
