import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { APP_NAME } from '../config/app.js'
import { useAppState } from '../state/useAppState.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Pure validation: returns an error message per invalid field.
function validate({ name, email }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Please enter your name.'
  if (!email.trim()) errors.email = 'Please enter your email.'
  else if (!EMAIL.test(email.trim())) errors.email = 'Enter a valid email, like name@example.com.'
  return errors
}

export default function Welcome() {
  const { signIn } = useAppState()
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '' })
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const errors = validate(values)
  const valid = Object.keys(errors).length === 0
  const shown = (field) => touched[field] && errors[field]

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }))

  async function submit(e) {
    e.preventDefault()
    setTouched({ name: true, email: true })
    if (!valid || submitting) return
    setSubmitting(true)
    setFormError('')
    try {
      await signIn({ name: values.name.trim(), email: values.email.trim() })   // saves details, loads words + progress
      navigate('/play')
    } catch {
      setFormError('Could not connect. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <main className="welcome">
      <span className="seal" aria-hidden="true">汉</span>
      <h1>{APP_NAME}</h1>
      <p className="welcome-sub">Learn HSK 1 vocabulary by matching characters to their pinyin.</p>

      <form className="card-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            autoFocus
            autoComplete="name"
            value={values.name}
            onChange={set('name')}
            onBlur={blur('name')}
            aria-invalid={!!shown('name')}
            aria-describedby="err-name"
          />
          <small id="err-name" className="error" role={shown('name') ? 'alert' : undefined}>{shown('name') || ''}</small>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={set('email')}
            onBlur={blur('email')}
            aria-invalid={!!shown('email')}
            aria-describedby="err-email"
          />
          <small id="err-email" className="error" role={shown('email') ? 'alert' : undefined}>{shown('email') || ''}</small>
        </div>
        <button type="submit" className="btn btn-primary" disabled={!valid || submitting}>Start matching</button>
        <small className="error" role={formError ? 'alert' : undefined}>{formError}</small>
      </form>
    </main>
  )
}
