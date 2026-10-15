// One card in either column. Always a real <button>; selection is exposed with aria-pressed.
export default function MatchCard({ kind, word, selected, onSelect, index }) {
  const text = kind === 'hanzi' ? word.hanzi : word.pinyin
  return (
    <button
      type="button"
      className={`match-card ${kind}${selected ? ' selected' : ''}`}
      aria-pressed={selected}
      aria-label={`${kind === 'hanzi' ? 'Hanzi' : 'Pinyin'}: ${text}`}
      style={{ '--i': index }}
      onClick={() => onSelect(kind, word.id)}
    >
      {text}
    </button>
  )
}
