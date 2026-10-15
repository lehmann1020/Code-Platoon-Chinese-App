import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContext } from './context.js'

const MAX_VISIBLE = 3
const DEFINITION_MS = 3500
const EXIT_MS = 160

// Toasts:
//   { kind: 'definition', word }  auto-dismisses after DEFINITION_MS; at most MAX_VISIBLE stack
//   { kind: 'congrats', heading, message, actionLabel, onAction }  stays until its button is clicked
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Set())
  const nextId = useRef(1)

  const later = useCallback((fn, ms) => {
    const t = setTimeout(() => { timers.current.delete(t); fn() }, ms)
    timers.current.add(t)
  }, [])

  useEffect(() => {
    const pending = timers.current
    return () => { pending.forEach(clearTimeout); pending.clear() }
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    later(() => setToasts((prev) => prev.filter((t) => t.id !== id)), EXIT_MS)
  }, [later])

  const definition = useCallback((word) => {
    const id = nextId.current++
    setToasts((prev) => {
      const next = [...prev.filter((t) => !t.leaving), { id, kind: 'definition', word }]
      const defs = next.filter((t) => t.kind === 'definition')
      const drop = new Set(defs.slice(0, Math.max(0, defs.length - MAX_VISIBLE)).map((t) => t.id))   // oldest definitions make room
      return next.filter((t) => !drop.has(t.id))
    })
    later(() => dismiss(id), DEFINITION_MS)
  }, [later, dismiss])

  // Persistent toast with one button. Clicking it dismisses the toast, then runs onAction.
  const congrats = useCallback((config) => {
    const id = nextId.current++
    setToasts((prev) => [...prev, { id, kind: 'congrats', ...config }])
    return id
  }, [])

  const act = useCallback((t) => { dismiss(t.id); t.onAction?.() }, [dismiss])

  const value = useMemo(() => ({ definition, congrats }), [definition, congrats])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (t.kind === 'congrats' ? (
          <div key={t.id} className={`toast congrats${t.leaving ? ' leaving' : ''}`}>
            <span className="toast-text">
              <strong className="toast-heading">{t.heading}</strong>
              <span className="toast-english">{t.message}</span>
            </span>
            <button type="button" className="btn btn-select" autoFocus onClick={() => act(t)}>{t.actionLabel}</button>
          </div>
        ) : (
          <div key={t.id} className={`toast definition${t.leaving ? ' leaving' : ''}`}>
            <span className="toast-hanzi" lang="zh">{t.word.hanzi}</span>
            <span className="toast-text">
              <span className="toast-pinyin">{t.word.pinyin}</span>
              <span className="toast-english">{t.word.english}</span>
            </span>
          </div>
        )))}
      </div>
    </ToastContext.Provider>
  )
}
