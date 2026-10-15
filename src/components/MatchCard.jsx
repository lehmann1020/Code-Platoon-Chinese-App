import { useState } from 'react'

const COLORS = ['#2f7d5b', '#2f6fdb', '#e0a526', '#1d1b19', '#4fae84']   // no red: red means wrong
const PARTICLES = 16

// Random burst: evenly spread angles with jitter, varied distance, size and color.
function makeParticles() {
  return Array.from({ length: PARTICLES }, (_, i) => {
    const angle = (i / PARTICLES) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    const dist = 70 + Math.random() * 80
    return {
      dx: Math.round(Math.cos(angle) * dist),
      dy: Math.round(Math.sin(angle) * dist),
      size: 6 + Math.round(Math.random() * 5),
      color: COLORS[i % COLORS.length],
      delay: Math.round(Math.random() * 60),
    }
  })
}

// One card in either column. Always a real <button>; selection is exposed with aria-pressed.
// state: undefined | 'burst' (correct match: explodes) | 'wrong' (red + shake)
export default function MatchCard({ kind, word, selected, state, onSelect, index }) {
  const text = kind === 'hanzi' ? word.hanzi : word.pinyin
  const [particles] = useState(makeParticles)
  return (
    <button
      type="button"
      className={`match-card ${kind}${selected ? ' selected' : ''}${state ? ` ${state}` : ''}`}
      aria-pressed={selected}
      aria-label={`${kind === 'hanzi' ? 'Hanzi' : 'Pinyin'}: ${text}`}
      aria-disabled={!!state || undefined}
      style={{ '--i': index }}
      onClick={() => onSelect(kind, word.id)}
    >
      <span className="card-text" lang={kind === 'hanzi' ? 'zh' : undefined}>{text}</span>
      {state === 'burst' && (
        <span className="particles" aria-hidden="true">
          {particles.map((p, i) => (
            <i key={i} style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--s': `${p.size}px`, '--c': p.color, '--d': `${p.delay}ms` }} />
          ))}
        </span>
      )}
    </button>
  )
}
