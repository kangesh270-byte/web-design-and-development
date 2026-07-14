import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

interface CustomerRouteProps {
  children: ReactNode
}

export function CustomerRoute({
  children,
}: CustomerRouteProps) {
  const {
    session,
    profile,
    loading,
  } = useAuth()

  if (loading) {
    return (
      <div className="route-loading">
        Loading...
      </div>
    )
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (!profile) {
    return (
      <div className="route-loading">
        Loading profile...
      </div>
    )
  }

  if (profile.role === 'admin') {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return <>{children}</>
}