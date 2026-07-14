import {
  FormEvent,
  useEffect,
  useState,
} from 'react'

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  supabase,
} from '../lib/supabaseClient'


export function ResetPassword() {

  const navigate =
    useNavigate()


  const [
    password,
    setPassword,
  ] = useState('')


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')


  const [
    showPassword,
    setShowPassword,
  ] = useState(false)


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)


  const [
    loading,
    setLoading,
  ] = useState(false)


  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true)


  const [
    recoverySessionAvailable,
    setRecoverySessionAvailable,
  ] = useState(false)


  const [
    error,
    setError,
  ] = useState('')


  const [
    success,
    setSuccess,
  ] = useState('')


  /*
    CHECK WHETHER THE USER
    OPENED A VALID PASSWORD
    RECOVERY EMAIL LINK
  */

  useEffect(() => {

    let active =
      true


    async function
    checkRecoverySession() {

      try {

        const {
          data,
        } = await supabase
          .auth
          .getSession()


        if (
          !active
        ) {
          return
        }


        if (
          data.session
        ) {

          setRecoverySessionAvailable(
            true
          )

        }


      } catch (
        sessionError
      ) {

        console.error(
          'Password recovery session error:',
          sessionError
        )

      } finally {

        if (
          active
        ) {

          setCheckingSession(
            false
          )

        }

      }

    }


    checkRecoverySession()


    const {
      data:
        authListener,
    } = supabase
      .auth
      .onAuthStateChange(

        (
          event,
          session
        ) => {

          if (
            !active
          ) {
            return
          }


          if (
            event ===
              'PASSWORD_RECOVERY' ||

            session
          ) {

            setRecoverySessionAvailable(
              true
            )

            setCheckingSession(
              false
            )

          }

        }

      )


    return () => {

      active =
        false


      authListener
        .subscription
        .unsubscribe()

    }

  }, [])


  /*
    UPDATE PASSWORD
  */

  async function
  handlePasswordUpdate(

    event:
      FormEvent<
        HTMLFormElement
      >

  ) {

    event
      .preventDefault()


    setError('')

    setSuccess('')


    /*
      CHECK RECOVERY
      SESSION
    */

    if (
      !recoverySessionAvailable
    ) {

      setError(

        'Your password reset link is invalid or expired. Please request a new password reset email.'

      )

      return

    }


    /*
      PASSWORD VALIDATION
    */

    if (
      password
        .length <
      8
    ) {

      setError(

        'Password must contain at least 8 characters.'

      )

      return

    }


    /*
      UPPERCASE CHECK
    */

    if (
      !/[A-Z]/
        .test(
          password
        )
    ) {

      setError(

        'Password must contain at least one uppercase letter.'

      )

      return

    }


    /*
      LOWERCASE CHECK
    */

    if (
      !/[a-z]/
        .test(
          password
        )
    ) {

      setError(

        'Password must contain at least one lowercase letter.'

      )

      return

    }


    /*
      NUMBER CHECK
    */

    if (
      !/[0-9]/
        .test(
          password
        )
    ) {

      setError(

        'Password must contain at least one number.'

      )

      return

    }


    /*
      CONFIRM PASSWORD
    */

    if (
      password !==
      confirmPassword
    ) {

      setError(

        'New password and confirm password do not match.'

      )

      return

    }


    setLoading(
      true
    )


    try {

      const {
        error:
          updateError,
      } = await supabase
        .auth
        .updateUser({

          password,

        })


      if (
        updateError
      ) {

        setError(
          updateError
            .message
        )

        return

      }


      setSuccess(

        'Your password has been updated successfully. Redirecting to login...'

      )


      setPassword('')

      setConfirmPassword('')


      /*
        SIGN OUT THE
        RECOVERY SESSION
      */

      await supabase
        .auth
        .signOut()


      /*
        REDIRECT TO LOGIN
      */

      window
        .setTimeout(

          () => {

            navigate(

              '/login',

              {
                replace:
                  true,
              }

            )

          },

          2000

        )


    } catch (
      unexpectedError
    ) {

      console.error(

        'Password update error:',

        unexpectedError

      )


      setError(

        'Unable to update your password. Please request a new reset link and try again.'

      )


    } finally {

      setLoading(
        false
      )

    }

  }


  /*
    LOADING SCREEN
  */

  if (
    checkingSession
  ) {

    return (

      <main
        style={{

          minHeight:
            '100vh',

          display:
            'flex',

          alignItems:
            'center',

          justifyContent:
            'center',

          background:
            '#07111f',

          color:
            '#ffffff',

        }}
      >

        <div
          style={{

            display:
              'flex',

            alignItems:
              'center',

            gap:
              '12px',

            fontWeight:
              700,

          }}
        >

          <Loader2

            size={24}

            className="spin"

          />


          Verifying reset link...

        </div>

      </main>

    )

  }


  return (

    <main
      style={{

        minHeight:
          '100vh',

        display:
          'flex',

        alignItems:
          'center',

        justifyContent:
          'center',

        padding:
          '24px',

        background:

          `radial-gradient(
            circle at top,
            #162b46 0%,
            #091728 48%,
            #050d18 100%
          )`,

        fontFamily:
          'Inter, Arial, sans-serif',

      }}
    >


      <section
        style={{

          width:
            '100%',

          maxWidth:
            '470px',

          padding:
            '38px',

          border:

            `1px solid
            rgba(
              239,
              169,
              45,
              0.25
            )`,

          borderRadius:
            '24px',

          background:

            `linear-gradient(
              145deg,
              rgba(
                22,
                39,
                62,
                0.98
              ),
              rgba(
                7,
                18,
                32,
                0.98
              )
            )`,

          boxShadow:

            `0 30px 70px
            rgba(
              0,
              0,
              0,
              0.48
            )`,

        }}
      >


        <div
          style={{

            width:
              '70px',

            height:
              '70px',

            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'center',

            margin:
              '0 auto 22px',

            borderRadius:
              '20px',

            color:
              '#f5ae2e',

            background:

              `rgba(
                245,
                174,
                46,
                0.13
              )`,

          }}
        >

          <KeyRound
            size={35}
          />

        </div>


        <div
          style={{

            textAlign:
              'center',

          }}
        >

          <span
            style={{

              color:
                '#f5ae2e',

              fontSize:
                '12px',

              fontWeight:
                800,

              letterSpacing:
                '1.4px',

            }}
          >

            ACCOUNT SECURITY

          </span>


          <h1
            style={{

              margin:
                '10px 0',

              color:
                '#ffffff',

              fontSize:
                '31px',

            }}
          >

            Reset Password

          </h1>


          <p
            style={{

              margin:
                '0 0 28px',

              color:
                '#91a0b6',

              fontSize:
                '14px',

              lineHeight:
                1.6,

            }}
          >

            Create a secure new password
            for your account.

          </p>

        </div>


        {
          !recoverySessionAvailable && (

            <div
              style={{

                marginBottom:
                  '20px',

                padding:
                  '14px',

                border:

                  `1px solid
                  rgba(
                    248,
                    113,
                    113,
                    0.35
                  )`,

                borderRadius:
                  '12px',

                color:
                  '#fecaca',

                background:

                  `rgba(
                    127,
                    29,
                    29,
                    0.25
                  )`,

                fontSize:
                  '13px',

                lineHeight:
                  1.5,

              }}
            >

              This password reset link
              is invalid or expired.
              Return to login and request
              a new reset email.

            </div>

          )
        }


        <form

          onSubmit={
            handlePasswordUpdate
          }

        >


          <label
            style={{

              display:
                'block',

              marginBottom:
                '19px',

              color:
                '#dbe4f0',

              fontSize:
                '13px',

              fontWeight:
                700,

            }}
          >

            New Password


            <div
              style={{

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '11px',

                marginTop:
                  '8px',

                padding:
                  '0 14px',

                border:

                  `1px solid
                  rgba(
                    148,
                    163,
                    184,
                    0.25
                  )`,

                borderRadius:
                  '12px',

                background:
                  '#0a1728',

              }}
            >

              <LockKeyhole

                size={19}

                color=
                  "#7f91a8"

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

                placeholder=
                  "Enter new password"

                autoComplete=
                  "new-password"

                required

                onChange={

                  event =>

                    setPassword(

                      event
                        .target
                        .value

                    )

                }

                style={{

                  width:
                    '100%',

                  minHeight:
                    '50px',

                  border:
                    'none',

                  outline:
                    'none',

                  color:
                    '#ffffff',

                  background:
                    'transparent',

                  fontSize:
                    '14px',

                }}

              />


              <button

                type="button"

                aria-label=

                  "Show or hide password"

                onClick={() =>

                  setShowPassword(

                    current =>
                      !current

                  )

                }

                style={{

                  border:
                    'none',

                  color:
                    '#8fa0b7',

                  background:
                    'transparent',

                  cursor:
                    'pointer',

                }}

              >

                {
                  showPassword

                    ? (

                      <EyeOff
                        size={19}
                      />

                    )

                    : (

                      <Eye
                        size={19}
                      />

                    )
                }

              </button>

            </div>

          </label>


          <label
            style={{

              display:
                'block',

              marginBottom:
                '20px',

              color:
                '#dbe4f0',

              fontSize:
                '13px',

              fontWeight:
                700,

            }}
          >

            Confirm New Password


            <div
              style={{

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  '11px',

                marginTop:
                  '8px',

                padding:
                  '0 14px',

                border:

                  `1px solid
                  rgba(
                    148,
                    163,
                    184,
                    0.25
                  )`,

                borderRadius:
                  '12px',

                background:
                  '#0a1728',

              }}
            >

              <ShieldCheck

                size={19}

                color=
                  "#7f91a8"

              />


              <input

                type={

                  showConfirmPassword

                    ? 'text'

                    : 'password'

                }

                value={
                  confirmPassword
                }

                placeholder=
                  "Confirm new password"

                autoComplete=
                  "new-password"

                required

                onChange={

                  event =>

                    setConfirmPassword(

                      event
                        .target
                        .value

                    )

                }

                style={{

                  width:
                    '100%',

                  minHeight:
                    '50px',

                  border:
                    'none',

                  outline:
                    'none',

                  color:
                    '#ffffff',

                  background:
                    'transparent',

                  fontSize:
                    '14px',

                }}

              />


              <button

                type="button"

                aria-label=

                  "Show or hide confirm password"

                onClick={() =>

                  setShowConfirmPassword(

                    current =>
                      !current

                  )

                }

                style={{

                  border:
                    'none',

                  color:
                    '#8fa0b7',

                  background:
                    'transparent',

                  cursor:
                    'pointer',

                }}

              >

                {
                  showConfirmPassword

                    ? (

                      <EyeOff
                        size={19}
                      />

                    )

                    : (

                      <Eye
                        size={19}
                      />

                    )
                }

              </button>

            </div>

          </label>


          <div
            style={{

              marginBottom:
                '20px',

              color:
                '#8797ad',

              fontSize:
                '12px',

              lineHeight:
                1.7,

            }}
          >

            Password must contain:

            <br />

            • At least 8 characters

            <br />

            • One uppercase letter

            <br />

            • One lowercase letter

            <br />

            • One number

          </div>


          {
            error && (

              <div
                style={{

                  marginBottom:
                    '18px',

                  padding:
                    '13px',

                  border:

                    `1px solid
                    rgba(
                      248,
                      113,
                      113,
                      0.35
                    )`,

                  borderRadius:
                    '11px',

                  color:
                    '#fecaca',

                  background:

                    `rgba(
                      127,
                      29,
                      29,
                      0.25
                    )`,

                  fontSize:
                    '13px',

                }}
              >

                {error}

              </div>

            )
          }


          {
            success && (

              <div
                style={{

                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    '9px',

                  marginBottom:
                    '18px',

                  padding:
                    '13px',

                  border:

                    `1px solid
                    rgba(
                      74,
                      222,
                      128,
                      0.35
                    )`,

                  borderRadius:
                    '11px',

                  color:
                    '#bbf7d0',

                  background:

                    `rgba(
                      20,
                      83,
                      45,
                      0.25
                    )`,

                  fontSize:
                    '13px',

                }}
              >

                <CheckCircle2
                  size={18}
                />


                {success}

              </div>

            )
          }


          <button

            type="submit"

            disabled={

              loading ||

              !recoverySessionAvailable

            }

            style={{

              width:
                '100%',

              minHeight:
                '51px',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              gap:
                '9px',

              border:
                'none',

              borderRadius:
                '12px',

              color:
                '#111827',

              background:
                '#f5ae2e',

              fontSize:
                '14px',

              fontWeight:
                800,

              cursor:

                loading ||

                !recoverySessionAvailable

                  ? 'not-allowed'

                  : 'pointer',

              opacity:

                loading ||

                !recoverySessionAvailable

                  ? 0.6

                  : 1,

            }}

          >

            {
              loading

                ? (

                  <>

                    <Loader2

                      className=
                        "spin"

                      size={19}

                    />


                    Updating
                    Password...

                  </>

                )

                : (

                  <>

                    <KeyRound
                      size={19}
                    />


                    Update Password

                  </>

                )
            }

          </button>


          <button

            type="button"

            onClick={() =>

              navigate(
                '/login'
              )

            }

            style={{

              width:
                '100%',

              marginTop:
                '14px',

              padding:
                '11px',

              border:
                'none',

              color:
                '#9eabc0',

              background:
                'transparent',

              fontSize:
                '13px',

              fontWeight:
                700,

              cursor:
                'pointer',

            }}

          >

            Back to Login

          </button>

        </form>

      </section>

    </main>

  )

}