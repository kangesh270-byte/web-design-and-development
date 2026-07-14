import {
  FormEvent,
  useState,
} from 'react'

import {
  Navigate,
} from 'react-router-dom'

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  TrendingUp,
  User,
} from 'lucide-react'

import {
  useAuth,
} from '../context/AuthContext'

export function Login() {
  const {
    session,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
  } = useAuth()

  const [
    mode,
    setMode,
  ] = useState<
    'signin' |
    'signup' |
    'forgot'
  >('signin')

  const [
    email,
    setEmail,
  ] = useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    fullName,
    setFullName,
  ] = useState('')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null)

  const [
    info,
    setInfo,
  ] = useState<
    string | null
  >(null)

  const [
    busy,
    setBusy,
  ] = useState(false)

  if (session) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  function changeMode(
    newMode:
      | 'signin'
      | 'signup'
      | 'forgot'
  ) {
    setMode(newMode)

    setError(null)

    setInfo(null)

    setPassword('')
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault()

    setError(null)

    setInfo(null)

    setBusy(true)

    try {
      /* FORGOT PASSWORD */

      if (
        mode ===
        'forgot'
      ) {
        const result =
          await resetPassword(
            email
          )

        if (
          result.error
        ) {
          setError(
            result.error
          )
        } else {
          setInfo(
            'Password reset link sent. Check your Gmail inbox and spam folder.'
          )
        }

        return
      }

      /* SIGN IN */

      if (
        mode ===
        'signin'
      ) {
        const result =
          await signIn(
            email,
            password
          )

        if (
          result.error
        ) {
          setError(
            result.error
          )
        }

        return
      }

      /* SIGN UP */

      const result =
        await signUp(
          email,
          password,
          fullName
        )

      if (
        result.error
      ) {
        setError(
          result.error
        )
      } else {
        setInfo(
          'Account created. Check your Gmail inbox to confirm your email, then sign in.'
        )

        setMode(
          'signin'
        )

        setPassword('')
      }
    } catch (
      submitError
    ) {
      console.error(
        submitError
      )

      setError(
        'Something went wrong. Please try again.'
      )
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogleLogin() {
    setError(null)

    setInfo(null)

    setBusy(true)

    const result =
      await signInWithGoogle()

    if (
      result.error
    ) {
      setError(
        result.error
      )

      setBusy(false)
    }
  }

  return (
    <div className="login-page">

      <div className="login-glow login-glow-one" />

      <div className="login-glow login-glow-two" />

      <div className="login-container">

        {/* LOGO */}

        <div className="login-logo">

          <div className="login-logo-icon">

            <TrendingUp
              size={22}
              strokeWidth={
                2.6
              }
            />

          </div>

          <div>

            <strong>
              KONG
            </strong>

            <span>
              SALES REPORTER
            </span>

          </div>

        </div>

        {/* LOGIN CARD */}

        <form
          onSubmit={
            handleSubmit
          }
          className="login-card"
        >

          <div className="login-heading">

            <span>

              {mode ===
              'signin'
                ? 'WELCOME BACK'
                : mode ===
                  'signup'
                ? 'CREATE ACCOUNT'
                : 'ACCOUNT RECOVERY'}

            </span>

            <h1>

              {mode ===
              'signin'
                ? 'Sign in to your account'
                : mode ===
                  'signup'
                ? 'Create your account'
                : 'Forgot password?'}

            </h1>

            <p>

              {mode ===
              'signin'
                ? 'Enter your account details to continue.'
                : mode ===
                  'signup'
                ? 'Create an account to access your workspace.'
                : 'Enter your email and we will send a password reset link.'}

            </p>

          </div>

          {/* GOOGLE LOGIN */}

          {mode !==
            'forgot' && (
            <>

              <button
                type="button"
                className="google-login-button"
                onClick={
                  handleGoogleLogin
                }
                disabled={
                  busy
                }
              >

                <span className="google-logo">

                  G

                </span>

                Continue with Google

              </button>

              <div className="login-divider">

                <span>
                  OR CONTINUE WITH EMAIL
                </span>

              </div>

            </>
          )}

          {/* FULL NAME */}

          {mode ===
            'signup' && (

            <div className="login-field">

              <label>
                Full name
              </label>

              <div className="login-input-box">

                <User
                  size={17}
                />

                <input
                  type="text"
                  value={
                    fullName
                  }
                  onChange={
                    event =>
                      setFullName(
                        event
                          .target
                          .value
                      )
                  }
                  placeholder="Kangeshwaran S"
                  required
                />

              </div>

            </div>

          )}

          {/* EMAIL */}

          <div className="login-field">

            <label>
              Email address
            </label>

            <div className="login-input-box">

              <Mail
                size={17}
              />

              <input
                type="email"
                value={
                  email
                }
                onChange={
                  event =>
                    setEmail(
                      event
                        .target
                        .value
                    )
                }
                placeholder="you@gmail.com"
                required
              />

            </div>

          </div>

          {/* PASSWORD */}

          {mode !==
            'forgot' && (

            <div className="login-field">

              <div className="password-label">

                <label>
                  Password
                </label>

                {mode ===
                  'signin' && (

                  <button
                    type="button"
                    onClick={() =>
                      changeMode(
                        'forgot'
                      )
                    }
                  >

                    Forgot password?

                  </button>

                )}

              </div>

              <div className="login-input-box">

                <LockKeyhole
                  size={17}
                />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    password
                  }
                  onChange={
                    event =>
                      setPassword(
                        event
                          .target
                          .value
                      )
                  }
                  placeholder="Enter your password"
                  minLength={
                    6
                  }
                  required
                />

                <button
                  type="button"
                  className="password-eye"
                  onClick={() =>
                    setShowPassword(
                      current =>
                        !current
                    )
                  }
                >

                  {showPassword ? (

                    <EyeOff
                      size={17}
                    />

                  ) : (

                    <Eye
                      size={17}
                    />

                  )}

                </button>

              </div>

            </div>

          )}

          {/* ERROR */}

          {error && (

            <div className="login-error">

              {error}

            </div>

          )}

          {/* SUCCESS */}

          {info && (

            <div className="login-success">

              {info}

            </div>

          )}

          {/* SUBMIT */}

          <button
            className="login-submit-button"
            type="submit"
            disabled={
              busy
            }
          >

            {busy
              ? 'Please wait...'
              : mode ===
                'signin'
              ? 'Sign In'
              : mode ===
                'signup'
              ? 'Create Account'
              : 'Send Reset Link'}

          </button>

          {/* CHANGE PAGE */}

          <div className="login-footer">

            {mode ===
              'signin' ? (

              <>

                No account?{' '}

                <button
                  type="button"
                  onClick={() =>
                    changeMode(
                      'signup'
                    )
                  }
                >

                  Create account

                </button>

              </>

            ) : mode ===
              'signup' ? (

              <>

                Already have an
                account?{' '}

                <button
                  type="button"
                  onClick={() =>
                    changeMode(
                      'signin'
                    )
                  }
                >

                  Sign in

                </button>

              </>

            ) : (

              <button
                type="button"
                onClick={() =>
                  changeMode(
                    'signin'
                  )
                }
              >

                ← Back to sign in

              </button>

            )}

          </div>

        </form>

      </div>

    </div>
  )
}