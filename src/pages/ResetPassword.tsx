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
    newPassword,
    setNewPassword,
  ] = useState('')


  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')


  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false)


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false)


  const [
    checkingLink,
    setCheckingLink,
  ] = useState(true)


  const [
    validRecoveryLink,
    setValidRecoveryLink,
  ] = useState(false)


  const [
    updating,
    setUpdating,
  ] = useState(false)


  const [
    errorMessage,
    setErrorMessage,
  ] = useState('')


  const [
    successMessage,
    setSuccessMessage,
  ] = useState('')


  /*
    CHECK PASSWORD RESET SESSION

    When the customer clicks the
    password reset link in Gmail,
    Supabase creates a temporary
    recovery session.
  */

  useEffect(() => {

    let active =
      true


    async function
    checkRecoveryLink() {

      try {

        /*
          PKCE PASSWORD RESET LINK

          New Supabase recovery links
          can contain a code value.
        */

        const currentUrl =

          new URL(
            window
              .location
              .href
          )


        const recoveryCode =

          currentUrl
            .searchParams
            .get(
              'code'
            )


        if (
          recoveryCode
        ) {

          const {
            error:
              exchangeError,
          } = await supabase
            .auth
            .exchangeCodeForSession(
              recoveryCode
            )


          if (
            exchangeError
          ) {

            console.error(

              'Recovery code error:',

              exchangeError

            )

          }

        }


        /*
          CHECK CURRENT
          SUPABASE SESSION
        */

        const {
          data,
          error,
        } = await supabase
          .auth
          .getSession()


        if (
          !active
        ) {

          return

        }


        if (
          error
        ) {

          console.error(

            'Recovery session error:',

            error

          )


          setValidRecoveryLink(
            false
          )


          return

        }


        if (
          data.session
        ) {

          setValidRecoveryLink(
            true
          )

        } else {

          setValidRecoveryLink(
            false
          )

        }


      } catch (
        recoveryError
      ) {

        console.error(

          'Password recovery error:',

          recoveryError

        )


        if (
          active
        ) {

          setValidRecoveryLink(
            false
          )

        }


      } finally {

        if (
          active
        ) {

          setCheckingLink(
            false
          )

        }

      }

    }


    checkRecoveryLink()


    /*
      LISTEN FOR SUPABASE
      PASSWORD_RECOVERY EVENT
    */

    const {
      data:
        authListener,
    } = supabase
      .auth
      .onAuthStateChange(

        (
          event,
          currentSession
        ) => {

          if (
            !active
          ) {

            return

          }


          if (
            event ===
              'PASSWORD_RECOVERY'
          ) {

            setValidRecoveryLink(
              true
            )


            setCheckingLink(
              false
            )

          }


          if (
            currentSession
          ) {

            setValidRecoveryLink(
              true
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
    UPDATE CUSTOMER PASSWORD
  */

  async function
  handleUpdatePassword(

    event:
      FormEvent<
        HTMLFormElement
      >

  ) {

    event
      .preventDefault()


    setErrorMessage('')

    setSuccessMessage('')


    /*
      CHECK RESET LINK
    */

    if (
      !validRecoveryLink
    ) {

      setErrorMessage(

        'This password reset link is invalid or expired. Please request a new password reset email.'

      )


      return

    }


    /*
      EMPTY PASSWORD
    */

    if (
      !newPassword
    ) {

      setErrorMessage(

        'Enter your new password.'

      )


      return

    }


    /*
      MINIMUM LENGTH
    */

    if (
      newPassword
        .length <
      8
    ) {

      setErrorMessage(

        'Password must contain at least 8 characters.'

      )


      return

    }


    /*
      UPPERCASE LETTER
    */

    if (
      !/[A-Z]/
        .test(
          newPassword
        )
    ) {

      setErrorMessage(

        'Password must contain at least one uppercase letter.'

      )


      return

    }


    /*
      LOWERCASE LETTER
    */

    if (
      !/[a-z]/
        .test(
          newPassword
        )
    ) {

      setErrorMessage(

        'Password must contain at least one lowercase letter.'

      )


      return

    }


    /*
      NUMBER
    */

    if (
      !/[0-9]/
        .test(
          newPassword
        )
    ) {

      setErrorMessage(

        'Password must contain at least one number.'

      )


      return

    }


    /*
      PASSWORD MATCH
    */

    if (
      newPassword !==
      confirmPassword
    ) {

      setErrorMessage(

        'New password and confirm password do not match.'

      )


      return

    }


    setUpdating(
      true
    )


    try {

      /*
        UPDATE PASSWORD
        IN SUPABASE AUTH
      */

      const {
        error:
          updateError,
      } = await supabase
        .auth
        .updateUser({

          password:
            newPassword,

        })


      if (
        updateError
      ) {

        setErrorMessage(

          updateError
            .message

        )


        return

      }


      /*
        SHOW SUCCESS
      */

      setSuccessMessage(

        'Password updated successfully. Redirecting to the login page...'

      )


      setNewPassword('')

      setConfirmPassword('')


      /*
        SIGN OUT THE TEMPORARY
        PASSWORD RECOVERY SESSION
      */

      await supabase
        .auth
        .signOut()


      /*
        REDIRECT TO LOGIN

        Customer can enter the
        new password and login.
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


      setErrorMessage(

        'Unable to update your password. Please request a new reset link and try again.'

      )


    } finally {

      setUpdating(
        false
      )

    }

  }


  /*
    CHECKING RESET LINK
  */

  if (
    checkingLink
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
            '#06101d',

          color:
            '#ffffff',

          fontFamily:
            'Inter, Arial, sans-serif',

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

            fontSize:
              '15px',

            fontWeight:
              700,

          }}
        >

          <Loader2
            size={25}
          />


          Verifying your
          password reset link...

        </div>

      </main>

    )

  }


  /*
    RESET PASSWORD PAGE
  */

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

        boxSizing:
          'border-box',

        padding:
          '22px',

        background:

          `radial-gradient(
            circle at top,
            #193453 0%,
            #0a192b 48%,
            #040b14 100%
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
            '460px',

          boxSizing:
            'border-box',

          padding:
            '36px',

          border:

            `1px solid
            rgba(
              245,
              174,
              46,
              0.28
            )`,

          borderRadius:
            '25px',

          background:

            `linear-gradient(
              145deg,
              rgba(
                23,
                42,
                67,
                0.98
              ),
              rgba(
                7,
                18,
                32,
                0.99
              )
            )`,

          boxShadow:

            `0 30px 75px
            rgba(
              0,
              0,
              0,
              0.5
            )`,

        }}
      >


        <div
          style={{

            width:
              '72px',

            height:
              '72px',

            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'center',

            margin:
              '0 auto 22px',

            border:

              `1px solid
              rgba(
                245,
                174,
                46,
                0.32
              )`,

            borderRadius:
              '22px',

            color:
              '#f5ae2e',

            background:

              `rgba(
                245,
                174,
                46,
                0.12
              )`,

          }}
        >

          <KeyRound
            size={36}
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
                '11px',

              fontWeight:
                800,

              letterSpacing:
                '1.5px',

            }}
          >

            SECURE ACCOUNT RECOVERY

          </span>


          <h1
            style={{

              margin:
                '10px 0',

              color:
                '#ffffff',

              fontSize:
                '30px',

              lineHeight:
                1.2,

            }}
          >

            Create New Password

          </h1>


          <p
            style={{

              margin:
                '0 0 28px',

              color:
                '#91a1b8',

              fontSize:
                '14px',

              lineHeight:
                1.6,

            }}
          >

            Enter and confirm your
            new password to recover
            your account.

          </p>

        </div>


        {
          !validRecoveryLink && (

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
                    0.4
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
                    0.28
                  )`,

                fontSize:
                  '13px',

                lineHeight:
                  1.55,

              }}
            >

              This reset link is
              invalid or expired.
              Return to the login
              page and request a
              new password reset
              email.

            </div>

          )
        }


        <form
          onSubmit={
            handleUpdatePassword
          }
        >


          <label
            style={{

              display:
                'block',

              marginBottom:
                '19px',

              color:
                '#dce5f1',

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
                    0.28
                  )`,

                borderRadius:
                  '12px',

                background:
                  '#081525',

              }}
            >

              <LockKeyhole

                size={19}

                color=
                  "#8293aa"

              />


              <input

                type={

                  showNewPassword

                    ? 'text'

                    : 'password'

                }

                value={
                  newPassword
                }

                placeholder=
                  "Enter new password"

                autoComplete=
                  "new-password"

                required

                onChange={

                  event =>

                    setNewPassword(

                      event
                        .target
                        .value

                    )

                }

                style={{

                  width:
                    '100%',

                  minWidth:
                    0,

                  minHeight:
                    '52px',

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

                  "Show or hide new password"

                onClick={() =>

                  setShowNewPassword(

                    current =>

                      !current

                  )

                }

                style={{

                  display:
                    'flex',

                  border:
                    'none',

                  padding:
                    '5px',

                  color:
                    '#91a1b7',

                  background:
                    'transparent',

                  cursor:
                    'pointer',

                }}

              >

                {
                  showNewPassword

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
                '19px',

              color:
                '#dce5f1',

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
                    0.28
                  )`,

                borderRadius:
                  '12px',

                background:
                  '#081525',

              }}
            >

              <LockKeyhole

                size={19}

                color=
                  "#8293aa"

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

                  minWidth:
                    0,

                  minHeight:
                    '52px',

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

                  display:
                    'flex',

                  border:
                    'none',

                  padding:
                    '5px',

                  color:
                    '#91a1b7',

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

              padding:
                '13px',

              borderRadius:
                '11px',

              color:
                '#8fa0b7',

              background:

                `rgba(
                  8,
                  21,
                  37,
                  0.75
                )`,

              fontSize:
                '12px',

              lineHeight:
                1.75,

            }}
          >

            Password requirements:

            <br />

            • Minimum 8 characters

            <br />

            • One uppercase letter

            <br />

            • One lowercase letter

            <br />

            • One number

          </div>


          {
            errorMessage && (

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
                      0.4
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
                      0.28
                    )`,

                  fontSize:
                    '13px',

                  lineHeight:
                    1.5,

                }}
              >

                {
                  errorMessage
                }

              </div>

            )
          }


          {
            successMessage && (

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
                      0.4
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
                      0.28
                    )`,

                  fontSize:
                    '13px',

                  lineHeight:
                    1.5,

                }}
              >

                <CheckCircle2
                  size={19}
                />


                {
                  successMessage
                }

              </div>

            )
          }


          <button

            type="submit"

            disabled={

              updating ||

              !validRecoveryLink

            }

            style={{

              width:
                '100%',

              minHeight:
                '52px',

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

                updating ||

                !validRecoveryLink

                  ? 'not-allowed'

                  : 'pointer',

              opacity:

                updating ||

                !validRecoveryLink

                  ? 0.58

                  : 1,

            }}

          >

            {
              updating

                ? (

                  <>

                    <Loader2
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
                '13px',

              padding:
                '11px',

              border:
                'none',

              color:
                '#9ba9bc',

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