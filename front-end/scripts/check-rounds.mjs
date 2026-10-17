// Simulates a whole game's worth of sets and checks the dealing rules. Run: npm run check:rounds
import { WORDS, getWord } from '../src/data/hsk1.js'
import { SET_SIZE } from '../src/config/app.js'
import { makeRound, shuffle } from '../src/lib/rounds.js'

const problems = []
let games = 0
const setCounts = new Set()

for (let g = 0; g < 200; g++) {
  const words = shuffle(WORDS)
  const matched = new Set()
  let sets = 0
  while (matched.size < words.length) {
    const r = makeRound(words, matched)
    if (r.ids.length === 0) { problems.push(`game ${g}: empty set with ${words.length - matched.size} words left`); break }
    if (r.ids.length > SET_SIZE) problems.push(`set larger than ${SET_SIZE}`)
    const pinyins = r.ids.map((id) => getWord(id).pinyin)
    if (new Set(pinyins).size !== pinyins.length) problems.push(`game ${g}: repeated pinyin in a set: ${pinyins}`)
    if (new Set(r.ids).size !== r.ids.length) problems.push(`game ${g}: repeated word in a set`)
    if ([...r.left].sort().join() !== [...r.ids].sort().join() || [...r.right].sort().join() !== [...r.ids].sort().join()) problems.push(`game ${g}: columns don't contain the set`)
    if (r.ids.length > 1 && r.left.some((id, i) => id === r.right[i])) problems.push(`game ${g}: columns line up`)
    for (const id of r.ids) { if (matched.has(id)) problems.push(`game ${g}: word dealt twice`); matched.add(id) }
    sets++
  }
  setCounts.add(sets); games++
}

console.log(`Simulated ${games} full games`)
console.log(`Sets per game: ${[...setCounts].sort((a, b) => a - b).join(', ')}`)
if (problems.length) { console.log(`\n${problems.length} problem(s):`); [...new Set(problems)].slice(0, 10).forEach((p) => console.log(' - ' + p)); process.exit(1) }
console.log('All checks passed.')
