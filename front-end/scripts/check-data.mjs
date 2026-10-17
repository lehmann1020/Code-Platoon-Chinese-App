// Validates src/data/hsk1.js. Run: npm run check:data
import { WORDS, TOTAL_WORDS, LEVEL_COUNT } from '../src/data/hsk1.js'
import { SET_SIZE } from '../src/config/app.js'

const problems = []
const note = (msg) => problems.push(msg)

const PINYIN_OK = /^[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü' ]+$/
const TONE_MARKED = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/
const NEUTRAL_ONLY = new Set(['de', 'ne', 'ma', 'le'])   // particles legitimately written without a tone mark
const HAN = /^\p{Script=Han}+$/u

const seen = { id: new Map(), hanzi: new Map() }
for (const w of WORDS) {
  for (const k of ['id', 'hanzi', 'pinyin', 'english']) if (!w[k] || !String(w[k]).trim()) note(`${w.id}: empty ${k}`)
  if (seen.id.has(w.id)) note(`duplicate id ${w.id}`); seen.id.set(w.id, 1)
  if (seen.hanzi.has(w.hanzi)) note(`duplicate hanzi ${w.hanzi}`); seen.hanzi.set(w.hanzi, 1)
  if (!HAN.test(w.hanzi)) note(`${w.id}: hanzi has non-Han characters: ${w.hanzi}`)
  if (!PINYIN_OK.test(w.pinyin)) note(`${w.id}: odd characters in pinyin: ${w.pinyin}`)
  if (!TONE_MARKED.test(w.pinyin) && !NEUTRAL_ONLY.has(w.pinyin)) note(`${w.id} ${w.hanzi}: pinyin "${w.pinyin}" has no tone mark`)
}

// Levels: every word has one (1..LEVEL_COUNT) and no level is empty.
const perLevel = new Map()
for (const w of WORDS) {
  if (!Number.isInteger(w.level) || w.level < 1 || w.level > LEVEL_COUNT) note(`${w.id} ${w.hanzi}: missing or invalid level`)
  else perLevel.set(w.level, (perLevel.get(w.level) ?? 0) + 1)
}
for (let l = 1; l <= LEVEL_COUNT; l++) if (!perLevel.get(l)) note(`level ${l} has no words`)

// Pinyin shared by several words (informational; sets must never contain two of these together)
const byPinyin = new Map()
for (const w of WORDS) byPinyin.set(w.pinyin, [...(byPinyin.get(w.pinyin) ?? []), w.hanzi])
const shared = [...byPinyin].filter(([, hs]) => hs.length > 1)

// Can the words be dealt into sets of SET_SIZE with no repeated pinyin inside a set?
// Needs: the most-repeated pinyin appears in no more words than there are sets.
const sets = Math.ceil(WORDS.length / SET_SIZE)
const maxRepeat = Math.max(...[...byPinyin.values()].map((hs) => hs.length))
if (maxRepeat > sets) note(`a pinyin repeats ${maxRepeat}x but there are only ${sets} sets`)

console.log(`Words: ${TOTAL_WORDS}`)
console.log(`Sets of ${SET_SIZE}: ${sets} (last set has ${WORDS.length - (sets - 1) * SET_SIZE} cards)`)
console.log(`Levels: ${[...perLevel].sort((a, b) => a[0] - b[0]).map(([l, n]) => `${l}=${n}`).join(' ')}`)
console.log(`Shared pinyin (kept out of the same set): ${shared.map(([p, hs]) => `${p} = ${hs.join(' / ')}`).join('; ') || 'none'}`)
if (problems.length) { console.log(`\n${problems.length} problem(s):`); problems.forEach((p) => console.log(' - ' + p)); process.exit(1) }
console.log('All checks passed.')
