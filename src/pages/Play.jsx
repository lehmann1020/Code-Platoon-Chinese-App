import { useEffect, useRef, useState } from 'react'
import MatchCard from '../components/MatchCard.jsx'
import Tracker from '../components/Tracker.jsx'
import { getWord } from '../data/hsk1.js'
import { useAppState } from '../state/useAppState.js'
import { useToast } from '../toast/useToast.js'

const BURST_MS = 1100  // explosion length (matches the 1.05s card-pop animation)
const SHAKE_MS = 450   // wrong-match shake length

export default function Play() {
  const { round, matched, setMatched, total, restart, nextRound } = useAppState()
  const toast = useToast()
  const [selected, setSelected] = useState(null)   // { kind: 'hanzi' | 'pinyin', id } | null
  const [anim, setAnim] = useState({})             // `${kind}:${id}` -> 'burst' | 'wrong'
  const [locked, setLocked] = useState(false)      // input is blocked while a wrong-match shake plays
  const timers = useRef(new Set())
  const boardRef = useRef(null)
  const announced = useRef(null)               // the round we've already congratulated

  useEffect(() => {
    const pending = timers.current
    return () => { pending.forEach(clearTimeout); pending.clear() }
  }, [])
  // Keyboard users: put focus on the first card whenever a new set arrives (including the first set and after "Play again").
  const focusFirstCard = () => requestAnimationFrame(() => boardRef.current?.querySelector('.match-card:not([aria-disabled="true"])')?.focus({ preventScroll: true }))
  useEffect(() => { focusFirstCard() }, [round])

  const later = (fn, ms) => {
    const t = setTimeout(() => { timers.current.delete(t); fn() }, ms)
    timers.current.add(t)
  }

  const setAnimFor = (keys, value) => setAnim((prev) => {
    const next = { ...prev }
    keys.forEach((k) => { if (value) next[k] = value; else delete next[k] })
    return next
  })

  // When every card in the set is matched (and the last explosion has finished), congratulate.
  // The toast stays until clicked: "Continue" deals the next set; after the final set it offers "Play again".
  const bursting = Object.values(anim).includes('burst')
  const roundDone = round.ids.every((id) => matched.has(id))
  useEffect(() => {
    if (!roundDone || bursting || announced.current === round) return
    announced.current = round
    if (matched.size >= total) {
      toast.congrats({ heading: 'Congratulations!', message: `You matched all ${total} HSK 1 words.`, actionLabel: 'Play again', onAction: restart })
    } else {
      toast.congrats({ heading: 'Congratulations!', message: `You matched all ${round.ids.length} words in this set.`, actionLabel: 'Continue', onAction: nextRound })
    }
  }, [roundDone, bursting, round, matched.size, total, toast, restart, nextRound])

  function evaluate(hanziId, pinyinId) {
    const keys = [`hanzi:${hanziId}`, `pinyin:${pinyinId}`]
    if (hanziId === pinyinId) {                         // correct: explode, show the definition, count it
      setMatched((prev) => new Set(prev).add(hanziId))
      setAnimFor(keys, 'burst')
      toast.definition(getWord(hanziId))
      // After the explosion the matched cards unmount; if that dropped keyboard focus, move it to the next card.
      later(() => {
        setAnimFor(keys, null)
        requestAnimationFrame(() => {
          if (!document.activeElement || document.activeElement === document.body) focusFirstCard()
        })
      }, BURST_MS)
    } else {                                            // wrong: red + shake, then reset
      setLocked(true)
      setAnimFor(keys, 'wrong')
      later(() => { setAnimFor(keys, null); setLocked(false) }, SHAKE_MS)
    }
  }

  // Click selects; click again deselects; another card in the SAME column moves the selection;
  // a card in the OTHER column makes a pair (order doesn't matter).
  function handleSelect(kind, id) {
    if (locked || anim[`${kind}:${id}`]) return
    if (!selected) return setSelected({ kind, id })
    if (selected.kind === kind) return setSelected(selected.id === id ? null : { kind, id })
    setSelected(null)
    evaluate(kind === 'hanzi' ? id : selected.id, kind === 'pinyin' ? id : selected.id)
  }

  // A matched card stays on screen only while its explosion plays.
  const column = (kind, ids) => ids
    .filter((id) => !matched.has(id) || anim[`${kind}:${id}`] === 'burst')
    .map((id, i) => (
      <MatchCard
        key={id}
        kind={kind}
        word={getWord(id)}
        index={i}
        state={anim[`${kind}:${id}`]}
        selected={selected?.kind === kind && selected.id === id}
        onSelect={handleSelect}
      />
    ))

  return (
    <>
      <main className="board-page" ref={boardRef}>
        <div className="board">
          <section className="column" aria-label="Hanzi">
            <h2 className="column-title">Hanzi</h2>
            {column('hanzi', round.left)}
          </section>
          <section className="column" aria-label="Pinyin">
            <h2 className="column-title">Pinyin</h2>
            {column('pinyin', round.right)}
          </section>
        </div>
      </main>
      <Tracker />
    </>
  )
}
