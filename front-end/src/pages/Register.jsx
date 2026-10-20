import { useState } from 'react'
import { Link } from 'react-router-dom'
import { APP_NAME } from '../config/app.js'
import { useAuth } from '../state/useAuth.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_PASSWORD = 6   // Supabase's default minimum

// Pure validation: returns an error message per invalid field.
function validate({ name, email, password }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Please enter your name.'
  if (!email.trim()) errors.email = 'Please enter your email.'
  else if (!EMAIL.test(email.trim())) errors.email = 'Enter a valid email, like name@example.com.'
  if (password.length < MIN_PASSWORD) errors.password = `Use at least ${MIN_PASSWORD} characters.`
  return errors
}

function friendly(err) {
  if (/already registered/i.test(err.message)) return 'An account with that email already exists. Try logging in.'
  if (/fetch/i.test(err.message)) return 'Could not connect. Please try again.'
  return `${err.message.replace(/\.$/, '')}.`
}

export default function Register() {
  const { signUp } = useAuth()
  const [values, setValues] = useState({ name: '', email: '', password: '' })
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
    setTouched({ name: true, email: true, password: true })
    if (!valid || submitting) return
    setSubmitting(true)
    setFormError('')
    try {
      await signUp({ name: values.name.trim(), email: values.email.trim(), password: values.password })   // GuestOnly then redirects
    } catch (err) {
      setFormError(friendly(err))
      setSubmitting(false)
    }
  }

  return (
    <main className="welcome">
      <span className="seal" aria-hidden="true">汉</span>
      <h1>Create your account</h1>
      <p className="welcome-sub">Your {APP_NAME} progress, saved to you.</p>

      <form className="card-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" autoFocus autoComplete="name" value={values.name} onChange={set('name')} onBlur={blur('name')}
            aria-invalid={!!shown('name')} aria-describedby="err-name" />
          <small id="err-name" className="error" role={shown('name') ? 'alert' : undefined}>{shown('name') || ''}</small>
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={values.email} onChange={set('email')} onBlur={blur('email')}
            aria-invalid={!!shown('email')} aria-describedby="err-email" />
          <small id="err-email" className="error" role={shown('email') ? 'alert' : undefined}>{shown('email') || ''}</small>
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" value={values.password} onChange={set('password')} onBlur={blur('password')}
            aria-invalid={!!shown('password')} aria-describedby="err-password" />
          <small id="err-password" className={shown('password') ? 'error' : 'hint'} role={shown('password') ? 'alert' : undefined}>
            {shown('password') || `At least ${MIN_PASSWORD} characters.`}
          </small>
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
        <small className="error" role={formError ? 'alert' : undefined}>{formError}</small>
      </form>

      <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
    </main>
  )
}
