import { useState } from 'react'
import { Link } from 'react-router-dom'
import { APP_NAME } from '../config/app.js'
import { useAuth } from '../state/useAuth.js'

// Pure validation: returns an error message per invalid field.
function validate({ email, password }) {
  const errors = {}
  if (!email.trim()) errors.email = 'Please enter your email.'
  if (!password) errors.password = 'Please enter your password.'
  return errors
}

function friendly(err) {
  if (/invalid login credentials/i.test(err.message)) return 'That email and password don’t match an account.'
  if (/fetch/i.test(err.message)) return 'Could not connect. Please try again.'
  return `${err.message.replace(/\.$/, '')}.`
}

export default function Login() {
  const { signIn } = useAuth()
  const [values, setValues] = useState({ email: '', password: '' })
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
    setTouched({ email: true, password: true })
    if (!valid || submitting) return
    setSubmitting(true)
    setFormError('')
    try {
      await signIn({ email: values.email.trim(), password: values.password })   // GuestOnly then redirects
    } catch (err) {
      setFormError(friendly(err))
      setSubmitting(false)
    }
  }

  return (
    <main className="welcome">
      <span className="seal" aria-hidden="true">汉</span>
      <h1>{APP_NAME}</h1>
      <p className="welcome-sub">Log in to pick up where you left off.</p>

      <form className="card-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoFocus autoComplete="email" value={values.email} onChange={set('email')} onBlur={blur('email')}
            aria-invalid={!!shown('email')} aria-describedby="err-email" />
          <small id="err-email" className="error" role={shown('email') ? 'alert' : undefined}>{shown('email') || ''}</small>
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={values.password} onChange={set('password')} onBlur={blur('password')}
            aria-invalid={!!shown('password')} aria-describedby="err-password" />
          <small id="err-password" className="error" role={shown('password') ? 'alert' : undefined}>{shown('password') || ''}</small>
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Logging in…' : 'Log in'}</button>
        <small className="error" role={formError ? 'alert' : undefined}>{formError}</small>
      </form>

      <p className="auth-switch">New to {APP_NAME}? <Link to="/register">Create an account</Link></p>
    </main>
  )
}
