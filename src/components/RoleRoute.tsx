import {
  Navigate,
  Outlet,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'


type RoleRouteProps = {
  allowedRoles:
    string[]
}


export function RoleRoute({
  allowedRoles,
}: RoleRouteProps) {

  const {
    session,
    profile,
    loading,
  } = useAuth()


  /*
    WAIT UNTIL
    AUTHENTICATION AND
    PROFILE ARE LOADED
  */

  if (
    loading
  ) {
    return (

      <div
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

          fontSize:
            '16px',

          fontWeight:
            700,
        }}
      >

        Loading...

      </div>

    )
  }


  /*
    USER IS NOT
    LOGGED IN
  */

  if (
    !session
  ) {
    return (

      <Navigate

        to="/login"

        replace

      />

    )
  }


  /*
    PROFILE IS NOT
    AVAILABLE
  */

  if (
    !profile
  ) {
    return (

      <Navigate

        to="/login"

        replace

      />

    )
  }


  /*
    CHECK USER ROLE
  */

  const userRole =

    profile
      .role
      ?.toLowerCase()


  const normalizedRoles =

    allowedRoles
      .map(

        role =>

          role
            .toLowerCase()

      )


  /*
    USER DOES NOT
    HAVE PERMISSION
  */

  if (
    !normalizedRoles
      .includes(
        userRole
      )
  ) {

    if (
      userRole ===
      'admin'
    ) {
      return (

        <Navigate

          to="/admin"

          replace

        />

      )
    }


    return (

      <Navigate

        to="/customer"

        replace

      />

    )
  }


  /*
    USER HAS
    PERMISSION
  */

  return (
    <Outlet />
  )
}