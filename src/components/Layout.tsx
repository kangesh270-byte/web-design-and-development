import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  ChevronDown,
  LogOut,
  Menu,
  User,
} from 'lucide-react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  Sidebar,
} from './Sidebar'

import {
  useAuth,
} from '../context/AuthContext'

interface LayoutProps {
  children: ReactNode
  title: string
  eyebrow?: string
  action?: ReactNode
}

export function Layout({
  children,
  title,
  eyebrow,
  action,
}: LayoutProps) {
  const {
    profile,
    signOut,
  } = useAuth()

  const navigate =
    useNavigate()

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false)

  const [
    profileMenuOpen,
    setProfileMenuOpen,
  ] = useState(false)

  const profileMenuRef =
    useRef<HTMLDivElement | null>(
      null
    )

  const fullName =
    profile?.full_name?.trim() ||
    'User'

  const role =
    profile?.role
      ?.trim()
      .toLowerCase() ||
    'customer'

  const firstLetter =
    fullName
      .charAt(0)
      .toUpperCase()

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      const target =
        event.target as Node

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(
          target
        )
      ) {
        setProfileMenuOpen(
          false
        )
      }
    }

    function handleEscapeKey(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        setProfileMenuOpen(
          false
        )

        setSidebarOpen(
          false
        )
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )

    document.addEventListener(
      'keydown',
      handleEscapeKey
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )

      document.removeEventListener(
        'keydown',
        handleEscapeKey
      )
    }
  }, [])

  useEffect(() => {
    if (
      sidebarOpen
    ) {
      document.body.style.overflow =
        'hidden'
    } else {
      document.body.style.overflow =
        ''
    }

    return () => {
      document.body.style.overflow =
        ''
    }
  }, [sidebarOpen])

  function closeSidebar() {
    setSidebarOpen(
      false
    )
  }

  async function handleSignOut() {
    setProfileMenuOpen(
      false
    )

    setSidebarOpen(
      false
    )

    await signOut()

    navigate(
      '/login',
      {
        replace: true,
      }
    )
  }

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <Sidebar
        open={
          sidebarOpen
        }
        onClose={
          closeSidebar
        }
      />

      {/* MAIN AREA */}

      <main className="layout-main">

        {/* HEADER */}

        <header className="layout-header">

          {/* LEFT SIDE */}

          <div className="layout-title-area">

            <button
              type="button"
              className="mobile-menu-button"
              aria-label="Open navigation menu"
              onClick={() =>
                setSidebarOpen(
                  true
                )
              }
            >
              <Menu
                size={22}
              />
            </button>

            <div className="page-heading">

              {eyebrow && (
                <p className="page-eyebrow">
                  {eyebrow}
                </p>
              )}

              <h1 className="page-title">
                {title}
              </h1>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="layout-header-actions">

            {action && (
              <div className="page-action">
                {action}
              </div>
            )}

            {/* PROFILE */}

            <div
              ref={
                profileMenuRef
              }
              className="top-profile-wrapper"
            >

              <button
                type="button"
                className="top-profile-button"
                aria-label="Open profile menu"
                aria-expanded={
                  profileMenuOpen
                }
                onClick={() =>
                  setProfileMenuOpen(
                    current =>
                      !current
                  )
                }
              >

                {/* AVATAR */}

                <div className="top-profile-avatar">

                  {firstLetter}

                  <span />

                </div>

                {/* NAME AND ROLE */}

                <div className="top-profile-information">

                  <strong>
                    {fullName}
                  </strong>

                  <small>
                    {role.toUpperCase()}
                  </small>

                </div>

                {/* ARROW */}

                <ChevronDown
                  size={17}
                  className={
                    profileMenuOpen
                      ? 'profile-arrow profile-arrow-open'
                      : 'profile-arrow'
                  }
                />

              </button>

              {/* PROFILE DROPDOWN */}

              {profileMenuOpen && (
                <div className="top-profile-menu">

                  <div className="profile-menu-user">

                    <div className="profile-menu-icon">

                      <User
                        size={18}
                      />

                    </div>

                    <div className="profile-menu-details">

                      <strong>
                        {fullName}
                      </strong>

                      <span>
                        {profile?.email ||
                          'No email'}
                      </span>

                      <small>
                        {role.toUpperCase()}
                      </small>

                    </div>

                  </div>

                  <div className="profile-menu-line" />

                  <button
                    type="button"
                    className="profile-signout-button"
                    onClick={
                      handleSignOut
                    }
                  >

                    <LogOut
                      size={17}
                    />

                    <span>
                      Sign out
                    </span>

                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}

        <section className="layout-content">

          {children}

        </section>

      </main>

    </div>
  )
}