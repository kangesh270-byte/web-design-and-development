import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import type {
  Session,
} from '@supabase/supabase-js'

import {
  supabase,
} from '../lib/supabaseClient'


type Profile = {
  id: string
  full_name: string | null
  email: string | null
  role: string
}


type AuthResult = {
  error: string | null
}


type AuthContextType = {
  session: Session | null

  profile: Profile | null

  loading: boolean

  signIn: (
    email: string,
    password: string
  ) => Promise<AuthResult>

  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<AuthResult>

  signInWithGoogle:
    () => Promise<AuthResult>

  resetPassword: (
    email: string
  ) => Promise<AuthResult>

  signOut:
    () => Promise<void>
}


const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined)


export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [
    session,
    setSession,
  ] = useState<
    Session | null
  >(null)

  const [
    profile,
    setProfile,
  ] = useState<
    Profile | null
  >(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const loadingUserId =
    useRef<
      string | null
    >(null)


  const loadProfile =
    useCallback(
      async (
        userId: string
      ) => {
        if (
          loadingUserId.current ===
          userId
        ) {
          return
        }

        loadingUserId.current =
          userId

        try {
          const {
            data,
            error,
          } = await supabase
            .from(
              'profiles'
            )
            .select(
              `
                id,
                full_name,
                email,
                role
              `
            )
            .eq(
              'id',
              userId
            )
            .maybeSingle()

          if (
            !error &&
            data
          ) {
            setProfile(
              data as Profile
            )

            return
          }

          if (error) {
            console.error(
              'Profile loading error:',
              error
            )
          }

          const {
            data:
              userData,

            error:
              userError,
          } = await supabase
            .auth
            .getUser()

          if (
            userError ||
            !userData.user
          ) {
            console.error(
              'User loading error:',
              userError
            )

            setProfile(null)

            return
          }

          const currentUser =
            userData.user

          const newProfile = {
            id:
              currentUser.id,

            full_name:
              currentUser
                .user_metadata
                ?.full_name ||

              currentUser
                .user_metadata
                ?.name ||

              'Customer',

            email:
              currentUser.email ||
              null,

            role:
              currentUser
                .user_metadata
                ?.role ||

              'customer',
          }

          const {
            data:
              createdProfile,

            error:
              createError,
          } = await supabase
            .from(
              'profiles'
            )
            .upsert(
              newProfile,
              {
                onConflict:
                  'id',
              }
            )
            .select(
              `
                id,
                full_name,
                email,
                role
              `
            )
            .single()

          if (createError) {
            console.error(
              'Profile creation error:',
              createError
            )

            setProfile(null)

            return
          }

          setProfile(
            createdProfile as Profile
          )
        } catch (
          profileError
        ) {
          console.error(
            'Unexpected profile error:',
            profileError
          )

          setProfile(null)
        } finally {
          loadingUserId.current =
            null
        }
      },

      []
    )


  useEffect(() => {
    let active =
      true

    async function initializeAuth() {
      try {
        setLoading(true)

        const {
          data,
          error,
        } = await supabase
          .auth
          .getSession()

        if (!active) {
          return
        }

        if (error) {
          console.error(
            'Session loading error:',
            error
          )

          setSession(null)

          setProfile(null)

          return
        }

        const currentSession =
          data.session

        setSession(
          currentSession
        )

        if (
          currentSession
            ?.user
            ?.id
        ) {
          await loadProfile(
            currentSession
              .user
              .id
          )
        } else {
          setProfile(null)
        }
      } catch (
        authError
      ) {
        console.error(
          'Authentication loading error:',
          authError
        )

        if (active) {
          setSession(null)

          setProfile(null)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const {
      data:
        authListener,
    } = supabase
      .auth
      .onAuthStateChange(
        (
          event,
          newSession
        ) => {
          if (!active) {
            return
          }

          setSession(
            newSession
          )

          if (
            event ===
              'SIGNED_OUT' ||
            !newSession
          ) {
            setProfile(null)

            setLoading(false)

            return
          }

          const userId =
            newSession
              .user
              .id

          window.setTimeout(
            async () => {
              if (!active) {
                return
              }

              await loadProfile(
                userId
              )

              if (active) {
                setLoading(false)
              }
            },

            0
          )
        }
      )

    return () => {
      active =
        false

      authListener
        .subscription
        .unsubscribe()
    }
  }, [
    loadProfile,
  ])


  async function signIn(
    email: string,
    password: string
  ): Promise<AuthResult> {
    const cleanEmail =
      email
        .trim()
        .toLowerCase()

    if (
      !cleanEmail
    ) {
      return {
        error:
          'Enter your email address.',
      }
    }

    if (
      !password
    ) {
      return {
        error:
          'Enter your password.',
      }
    }

    const {
      error,
    } = await supabase
      .auth
      .signInWithPassword({
        email:
          cleanEmail,

        password,
      })

    return {
      error:
        error
          ? error.message
          : null,
    }
  }


  async function signUp(
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResult> {
    const cleanEmail =
      email
        .trim()
        .toLowerCase()

    const cleanName =
      fullName
        .trim()

    if (
      !cleanName
    ) {
      return {
        error:
          'Enter your full name.',
      }
    }

    if (
      !cleanEmail
    ) {
      return {
        error:
          'Enter your email address.',
      }
    }

    if (
      password.length <
      6
    ) {
      return {
        error:
          'Password must contain at least 6 characters.',
      }
    }

    const {
      data,
      error,
    } = await supabase
      .auth
      .signUp({
        email:
          cleanEmail,

        password,

        options: {
          emailRedirectTo:
            window
              .location
              .origin,

          data: {
            full_name:
              cleanName,

            role:
              'customer',
          },
        },
      })

    if (error) {
      console.error(
        'Account creation error:',
        error.message
      )

      return {
        error:
          error.message,
      }
    }

    console.log(
      'Account created:',
      {
        userId:
          data
            .user
            ?.id,

        email:
          data
            .user
            ?.email,

        emailConfirmed:
          Boolean(
            data
              .user
              ?.email_confirmed_at
          ),

        hasSession:
          Boolean(
            data.session
          ),
      }
    )

    return {
      error:
        null,
    }
  }


  async function
  signInWithGoogle():
    Promise<AuthResult> {
    const {
      error,
    } = await supabase
      .auth
      .signInWithOAuth({
        provider:
          'google',

        options: {
          redirectTo:
            window
              .location
              .origin,
        },
      })

    return {
      error:
        error
          ? error.message
          : null,
    }
  }


  async function resetPassword(
    email: string
  ): Promise<AuthResult> {
    const cleanEmail =
      email
        .trim()
        .toLowerCase()

    if (
      !cleanEmail
    ) {
      return {
        error:
          'Enter your email address first.',
      }
    }

    const {
      error,
    } = await supabase
      .auth
      .resetPasswordForEmail(
        cleanEmail,

        {
          redirectTo:
            `${
              window
                .location
                .origin
            }/reset-password`,
        }
      )

    return {
      error:
        error
          ? error.message
          : null,
    }
  }


  async function signOut() {
    const {
      error,
    } = await supabase
      .auth
      .signOut()

    if (error) {
      console.error(
        'Sign-out error:',
        error
      )
    }

    loadingUserId.current =
      null

    setSession(null)

    setProfile(null)
  }


  return (
    <AuthContext.Provider
      value={{
        session,

        profile,

        loading,

        signIn,

        signUp,

        signInWithGoogle,

        resetPassword,

        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}


export function useAuth() {
  const context =
    useContext(
      AuthContext
    )

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    )
  }

  return context
}