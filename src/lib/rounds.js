import { SET_SIZE } from '../config/app.js'

// Fisher–Yates; returns a new array.
export function shuffle(items) {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Next set: up to SET_SIZE unmatched words, never two with the same pinyin
// (so a pinyin card can't match two hanzi). Words skipped for sharing pinyin wait for a later set.
export function dealSet(words, matched, size = SET_SIZE) {
  const used = new Set()
  const picked = []
  for (const w of words) {
    if (picked.length === size) break
    if (matched.has(w.id) || used.has(w.pinyin)) continue
    used.add(w.pinyin)
    picked.push(w)
  }
  return picked
}

// Two independently shuffled columns of word ids. The columns never line up
// (no word sits at the same row on both sides) when there is more than one card.
export function arrangeColumns(ids) {
  const left = shuffle(ids)
  if (ids.length < 2) return { left, right: [...left] }
  let right = shuffle(ids)
  while (right.some((id, i) => id === left[i])) right = shuffle(ids)
  return { left, right }
}

// The level being played: the lowest level that still has an unmatched word (undefined when all are matched).
export function currentLevel(words, matched) {
  const open = words.filter((w) => !matched.has(w.id))
  return open.length ? Math.min(...open.map((w) => w.level)) : undefined
}

// A whole round: a set from the current level only, plus the two column orders.
export function makeRound(words, matched) {
  const level = currentLevel(words, matched)
  const set = dealSet(words.filter((w) => w.level === level), matched)
  return { level, ids: set.map((w) => w.id), ...arrangeColumns(set.map((w) => w.id)) }
}
