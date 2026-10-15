import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContext } from './context.js'

const MAX_VISIBLE = 3
const DEFINITION_MS = 3500
const EXIT_MS = 160

// Toasts: { id, kind: 'definition', word, leaving }. Definition toasts auto-dismiss; at most MAX_VISIBLE stack.
// (Phase 5 adds a persistent "congratulations" kind with a button.)
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
    setToasts((prev) => [...prev.filter((t) => !t.leaving), { id, kind: 'definition', word }].slice(-MAX_VISIBLE))
    later(() => dismiss(id), DEFINITION_MS)
  }, [later, dismiss])

  const value = useMemo(() => ({ definition }), [definition])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={`toast definition${t.leaving ? ' leaving' : ''}`}>
            <span className="toast-hanzi" lang="zh">{t.word.hanzi}</span>
            <span className="toast-text">
              <span className="toast-pinyin">{t.word.pinyin}</span>
              <span className="toast-english">{t.word.english}</span>
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
