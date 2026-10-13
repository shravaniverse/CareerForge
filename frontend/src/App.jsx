import { useState } from 'react'
import Dashboard from './Dashboard'

function App() {
  const [isLogin, setIsLogin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    const endpoint = isLogin ? 'login' : 'register'

    try {
      const response = await fetch(
        `http://localhost:8080/api/auth/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            isLogin
              ? { email, password }
              : { name, email, password }
          ),
        }
      )

      const result = await response.json()

      if (response.ok) {
        if (isLogin) {
          if (!result.token) {
            setMessage(
              'Login succeeded, but the server did not return a token.'
            )
            return
          }

          localStorage.setItem('token', result.token)

          const loggedInUser = {
            name: result.name || email.split('@')[0],
            email: result.email || email,
          }

          localStorage.setItem('user', JSON.stringify(loggedInUser))

          setUser(loggedInUser)
          setIsLoggedIn(true)
          setMessage('')
        } else {
          setMessage('Registration successful! Please log in.')
          setName('')
          setPassword('')
          setIsLogin(true)
        }
      } else {
        setMessage(
          result.message || result.error || 'Something went wrong.'
        )
      }
    } catch {
      setMessage(
        'Could not connect to backend. Check whether it is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setUser(null)
    setIsLoggedIn(false)
    setIsLogin(true)
    setPassword('')
    setMessage('You have been logged out.')
  }

  if (isLoggedIn) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.brandIcon} aria-label="CareerForge logo">
          CF
        </div>

        <h1 style={styles.heading}>CareerForge</h1>

        <p style={styles.subtitle}>
          Prepare smarter. Get placed with confidence.
        </p>

        <div style={styles.formHeader}>
          <h2 style={styles.formHeading}>
            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </h2>

          <p style={styles.formSubtitle}>
            {isLogin
              ? 'Log in to continue your placement preparation.'
              : 'Create an account to start your placement journey.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <label style={styles.label}>
              Full Name

              <input
                style={styles.input}
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}

          <label style={styles.label}>
            Email Address

            <input
              style={styles.input}
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label style={styles.label}>
            Password

            <input
              style={styles.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                isLogin ? 'current-password' : 'new-password'
              }
              required
            />
          </label>

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'wait' : 'pointer',
            }}
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isLogin
                ? 'Login to Your Account'
                : 'Create Account'}
          </button>
        </form>

        {message && (
          <p
            role="status"
            style={
              /could not|wrong|failed|error|invalid|not return/i.test(
                message
              )
                ? styles.errorMessage
                : styles.message
            }
          >
            {message}
          </p>
        )}

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>OR</span>
          <span style={styles.dividerLine} />
        </div>

        <p style={styles.switchText}>
          {isLogin
            ? "Don't have an account?"
            : 'Already have an account?'}

          <button
            type="button"
            style={styles.switchButton}
            onClick={() => {
              setIsLogin(!isLogin)
              setMessage('')
            }}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>

        <p style={styles.footer}>
          Your journey towards your dream career starts here.
        </p>

        <p style={styles.copyright}>
          © {new Date().getFullYear()} CareerForge
        </p>
      </section>
    </main>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '28px 16px',
    background: '#f1f5fb',
    fontFamily: "Arial, 'Segoe UI', sans-serif",
    boxSizing: 'border-box',
  },

  card: {
    width: '100%',
    maxWidth: '485px',
    padding: '38px',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '18px',
    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
    boxSizing: 'border-box',
  },

  brandIcon: {
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    background: '#e8efff',
    color: '#2454c5',
    borderRadius: '14px',
    fontWeight: '800',
    fontSize: '17px',
    letterSpacing: '1px',
  },

  heading: {
    color: '#172554',
    textAlign: 'center',
    fontSize: '29px',
    lineHeight: 1.3,
    fontWeight: '800',
    margin: '0 0 9px',
  },

  subtitle: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: '14px',
    lineHeight: 1.7,
    margin: '0 0 30px',
  },

  formHeader: {
    textAlign: 'center',
    marginBottom: '25px',
  },

  formHeading: {
    color: '#172554',
    fontSize: '25px',
    fontWeight: '700',
    lineHeight: 1.3,
    margin: '0 0 8px',
  },

  formSubtitle: {
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.7,
    margin: 0,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    color: '#334155',
    fontSize: '14px',
    fontWeight: '600',
  },

  input: {
    display: 'block',
    width: '100%',
    minWidth: 0,
    padding: '13px 14px',
    border: '1px solid #cbd5e1',
    borderRadius: '9px',
    fontSize: '14px',
    lineHeight: 1.5,
    color: '#172033',
    background: '#ffffff',
    outlineColor: '#2563eb',
    boxSizing: 'border-box',
  },

  submitButton: {
    width: '100%',
    padding: '14px 16px',
    marginTop: '4px',
    background: '#285bd4',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9px',
    fontSize: '15px',
    fontWeight: '700',
    boxSizing: 'border-box',
  },

  message: {
    color: '#166534',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '11px',
    marginTop: '18px',
    fontSize: '13px',
    textAlign: 'center',
    overflowWrap: 'anywhere',
  },

  errorMessage: {
    color: '#b91c1c',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '11px',
    marginTop: '18px',
    fontSize: '13px',
    textAlign: 'center',
    overflowWrap: 'anywhere',
  },

  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
  },

  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e2e8f0',
  },

  dividerText: {
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: '700',
  },

  switchText: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '5px',
    textAlign: 'center',
    color: '#475569',
    fontSize: '13px',
    margin: 0,
  },

  switchButton: {
    background: 'transparent',
    border: 'none',
    color: '#2454c5',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '4px',
  },

  footer: {
    color: '#94a3b8',
    fontSize: '11px',
    lineHeight: 1.6,
    textAlign: 'center',
    marginTop: '24px',
  },

  copyright: {
    color: '#94a3b8',
    fontSize: '11px',
    textAlign: 'center',
    margin: '14px 0 0',
  },
}

export default App
