import { createClient } from '@supabase/supabase-js'
import { DEV_USER_ID } from '../config/app.js'

// Every Supabase call lives here. Publishable key only; no auth (see DEV_USER_ID).
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },   // no logins yet
)

const slugToUuid = new Map()   // 'hsk1-001' -> words.id (user_words.word_id is the uuid)
const uuidToSlug = new Map()
let session = null             // { id, startedAt } of the open game_sessions row

function check({ data, error }) {
  if (error) throw error
  return data
}

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
  const rows = check(await supabase.from('user_words').select('word_id').eq('user_id', DEV_USER_ID))
  return rows.map((r) => uuidToSlug.get(r.word_id)).filter(Boolean)
}

// A duplicate (23505) means it was already saved, which is fine.
export async function saveMatch(slug) {
  const { error } = await supabase.from('user_words').insert({ user_id: DEV_USER_ID, word_id: slugToUuid.get(slug) })
  if (error && error.code !== '23505') throw error
}

// Reuse the latest open session, otherwise start a new one.
export async function startSession() {
  const open = check(await supabase.from('game_sessions').select('id,started_at')
    .eq('user_id', DEV_USER_ID).is('completed_at', null).order('started_at', { ascending: false }).limit(1))
  const row = open[0] ?? check(await supabase.from('game_sessions').insert({ user_id: DEV_USER_ID }).select('id,started_at').single())
  session = { id: row.id, startedAt: row.started_at }
}

// completed_at must not be before the server's started_at, so never trust a slow client clock.
export async function finishSession() {
  if (!session) await startSession()
  const completedAt = new Date(Math.max(Date.now(), new Date(session.startedAt).getTime())).toISOString()
  check(await supabase.from('game_sessions').update({ completed_at: completedAt }).eq('id', session.id).select('id'))
  session = null
}

// "Play again": forget all matches and begin a new session.
export async function resetProgress() {
  check(await supabase.from('user_words').delete().eq('user_id', DEV_USER_ID).select('word_id'))
  session = null
  await startSession()
}

export async function updateUser({ name, email }) {
  check(await supabase.from('users').update({ name, email }).eq('id', DEV_USER_ID).select('id'))
}
