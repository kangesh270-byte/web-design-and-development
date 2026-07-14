import {
  BarChart3,
  Boxes,
  CircleHelp,
  LayoutDashboard,
  MapPin,
  ReceiptText,
  TrendingUp,
  UserRound,
  Users,
  X,
} from 'lucide-react'

import {
  NavLink,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

type SidebarProps = {
  open?: boolean

  onClose?: () => void
}

export function Sidebar({
  open = false,
  onClose,
}: SidebarProps) {
  const {
    profile,
  } = useAuth()

  const role =
    profile?.role
      ?.toLowerCase()

  const isAdmin =
    role === 'admin'


  /*
    ADMIN SIDEBAR LINKS
  */

  const adminLinks = [
    {
      name:
        'Dashboard',

      path:
        '/dashboard',

      icon:
        LayoutDashboard,
    },

    {
      name:
        'Customers',

      path:
        '/customers',

      icon:
        Users,
    },

    {
      name:
        'Products',

      path:
        '/products',

      icon:
        Boxes,
    },

    {
      name:
        'Sales / POS',

      path:
        '/sales',

      icon:
        ReceiptText,
    },

    {
      name:
        'Employees',

      path:
        '/employees',

      icon:
        UserRound,
    },

    {
      name:
        'Reports',

      path:
        '/reports',

      icon:
        BarChart3,
    },
  ]


  /*
    CUSTOMER SIDEBAR LINKS
  */

  const customerLinks = [
    {
      name:
        'Dashboard',

      path:
        '/customer',

      icon:
        LayoutDashboard,
    },

    {
      name:
        'Products',

      path:
        '/customer/products',

      icon:
        Boxes,
    },

    {
      name:
        'My Orders',

      path:
        '/customer/orders',

      icon:
        ReceiptText,
    },

    {
      name:
        'Track Order',

      path:
        '/customer/track-order',

      icon:
        MapPin,
    },

    {
      name:
        'My Profile',

      path:
        '/customer/profile',

      icon:
        UserRound,
    },

    {
      name:
        'Help & Support',

      path:
        '/customer/support',

      icon:
        CircleHelp,
    },
  ]


  /*
    ROLE BASED LINKS
  */

  const links =
    isAdmin
      ? adminLinks
      : customerLinks


  return (
    <>

      {/* MOBILE BACKGROUND */}

      {open && (

        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={
            onClose
          }
        />

      )}


      {/* SIDEBAR */}

      <aside
        className={
          open
            ? 'sidebar sidebar-open'
            : 'sidebar'
        }
      >


        {/* LOGO */}

        <div className="sidebar-brand">

          <div className="sidebar-logo">

            <TrendingUp
              size={22}
              strokeWidth={
                2.7
              }
            />

          </div>


          <div className="sidebar-brand-text">

            <strong>

              KONG

            </strong>

            <span>

              SALES REPORT

            </span>

          </div>


          {/* MOBILE CLOSE BUTTON */}

          <button
            type="button"
            className="sidebar-close-button"
            onClick={
              onClose
            }
            aria-label="Close sidebar"
          >

            <X
              size={21}
            />

          </button>

        </div>


        {/* NAVIGATION */}

        <nav className="sidebar-navigation">

          {links.map(
            link => {

              const Icon =
                link.icon

              return (

                <NavLink
                  key={
                    link.path
                  }

                  to={
                    link.path
                  }

                  onClick={
                    onClose
                  }

                  className={({
                    isActive,
                  }) =>
                    isActive
                      ? 'sidebar-link sidebar-link-active'
                      : 'sidebar-link'
                  }
                >

                  <Icon
                    size={19}

                    strokeWidth={
                      1.8
                    }
                  />


                  <span>

                    {
                      link.name
                    }

                  </span>

                </NavLink>

              )
            }
          )}

        </nav>


        {/* CUSTOMER HELP CARD */}

        {!isAdmin && (

          <div className="sidebar-help-card">

            <div className="sidebar-help-icon">

              <CircleHelp
                size={22}
              />

            </div>

            <div>

              <strong>

                Need Help?

              </strong>

              <p>

                Contact support
                for order help.

              </p>

            </div>

            <NavLink
              to="/customer/support"

              onClick={
                onClose
              }
            >

              Get Support

            </NavLink>

          </div>

        )}

      </aside>

    </>
  )
}