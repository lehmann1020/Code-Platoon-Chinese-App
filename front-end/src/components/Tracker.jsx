import { useAppState } from '../state/useAppState.js'

// Pinned to the bottom: matched / total across all sets.
export default function Tracker() {
  const { matched, total } = useAppState()
  const count = matched.size
  return (
    <footer className="tracker">
      <div className="tracker-inner">
        <p className="tracker-count"><span className="tracker-label">Matched</span> <strong>{count}</strong> / {total}</p>
        <div className="tracker-bar" role="progressbar" aria-label="Words matched" aria-valuemin={0} aria-valuemax={total} aria-valuenow={count}>
          <div className="tracker-fill" style={{ width: `${(count / total) * 100}%` }} />
        </div>
      </div>
    </footer>
  )
}
