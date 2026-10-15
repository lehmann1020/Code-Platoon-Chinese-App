import { useState } from 'react'
import MatchCard from '../components/MatchCard.jsx'
import Tracker from '../components/Tracker.jsx'
import { getWord } from '../data/hsk1.js'
import { useAppState } from '../state/useAppState.js'

export default function Play() {
  const { round, matched } = useAppState()
  const [selected, setSelected] = useState(null)        // { kind: 'hanzi' | 'pinyin', id } | null
  const [lastPair, setLastPair] = useState(null)        // Phase 3 debug only: proves the pair hook fires. Removed in Phase 4.

  // Selection rules: click selects; click again deselects; another card in the SAME column moves the
  // selection; a card in the OTHER column makes a pair (order doesn't matter).
  function handleSelect(kind, id) {
    if (!selected) return setSelected({ kind, id })
    if (selected.kind === kind) return setSelected(selected.id === id ? null : { kind, id })
    const hanziId = kind === 'hanzi' ? id : selected.id
    const pinyinId = kind === 'pinyin' ? id : selected.id
    setSelected(null)
    setLastPair({ hanziId, pinyinId })                  // Phase 4 replaces this with real evaluation
  }

  const column = (kind, ids) => ids.filter((id) => !matched.has(id)).map((id, i) => (
    <MatchCard key={id} kind={kind} word={getWord(id)} index={i} selected={selected?.kind === kind && selected.id === id} onSelect={handleSelect} />
  ))

  return (
    <>
      <main className="board-page">
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
        {lastPair && (
          <p className="debug" data-testid="last-pair">
            Phase 3 debug: paired {getWord(lastPair.hanziId).hanzi} with {getWord(lastPair.pinyinId).pinyin}
          </p>
        )}
      </main>
      <Tracker />
    </>
  )
}
