import {
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  Layout,
} from '../components/Layout'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabaseClient'


export function CustomerProfile() {
  const {
    profile,
  } = useAuth()


  const [
    fullName,
    setFullName,
  ] = useState('')


  const [
    email,
    setEmail,
  ] = useState('')


  const [
    saving,
    setSaving,
  ] = useState(false)


  const role =
    profile?.role
      ?.toLowerCase() ||
    'customer'


  const isAdmin =
    role === 'admin'


  const pageTitle =
    isAdmin
      ? 'Admin Profile'
      : 'My Profile'


  const pageEyebrow =
    isAdmin
      ? 'ADMIN PORTAL'
      : 'CUSTOMER PORTAL'


  const profileHeading =
    isAdmin
      ? 'Administrator Information'
      : 'Customer Information'


  const profileDescription =
    isAdmin
      ? 'View and update your administrator account information.'
      : 'View and update your personal account information.'


  useEffect(() => {
    setFullName(
      profile?.full_name ||
      ''
    )

    setEmail(
      profile?.email ||
      ''
    )
  }, [
    profile,
  ])


  async function saveProfile() {
    if (!profile?.id) {
      alert(
        'Profile not found. Please logout and login again.'
      )

      return
    }


    if (!fullName.trim()) {
      alert(
        'Please enter your full name.'
      )

      return
    }


    setSaving(true)


    const {
      error,
    } = await supabase
      .from('profiles')
      .update({
        full_name:
          fullName.trim(),
      })
      .eq(
        'id',
        profile.id
      )


    setSaving(false)


    if (error) {
      console.error(
        'Profile update error:',
        error
      )

      alert(
        `Unable to save profile:\n${error.message}`
      )

      return
    }


    alert(
      'Profile updated successfully!'
    )
  }


  const firstLetter =
    fullName
      .trim()
      .charAt(0)
      .toUpperCase() ||
    'U'


  return (
    <Layout
      title={
        pageTitle
      }
      eyebrow={
        pageEyebrow
      }
    >

      <div className="customer-feature-page">


        {/* PAGE HEADING */}

        <div className="feature-page-heading">

          <div>

            <h2>

              {
                profileHeading
              }

            </h2>

            <p>

              {
                profileDescription
              }

            </p>

          </div>


          <div className="feature-heading-icon">

            {isAdmin ? (

              <ShieldCheck
                size={27}
              />

            ) : (

              <UserRound
                size={27}
              />

            )}

          </div>

        </div>


        {/* PROFILE CARD */}

        <div className="customer-profile-card">


          {/* PROFILE LEFT SIDE */}

          <div className="profile-avatar-section">

            <div className="profile-large-avatar">

              {
                firstLetter
              }

            </div>


            <h3>

              {
                fullName ||
                'User'
              }

            </h3>


            <p>

              {
                email ||
                'No email'
              }

            </p>


            <div
              className={
                isAdmin
                  ? 'profile-role-badge profile-role-admin'
                  : 'profile-role-badge'
              }
            >

              {isAdmin && (

                <ShieldCheck
                  size={15}
                />

              )}


              {!isAdmin && (

                <UserRound
                  size={15}
                />

              )}


              {
                role
                  .toUpperCase()
              }

            </div>

          </div>


          {/* PROFILE FORM */}

          <div className="customer-profile-form">


            {/* FULL NAME */}

            <label>

              Full Name

              <div className="profile-input">

                <UserRound
                  size={19}
                />

                <input
                  type="text"
                  value={
                    fullName
                  }
                  placeholder="Enter full name"
                  onChange={
                    event =>
                      setFullName(
                        event
                          .target
                          .value
                      )
                  }
                />

              </div>

            </label>


            {/* EMAIL */}

            <label>

              Email Address

              <div className="profile-input">

                <Mail
                  size={19}
                />

                <input
                  type="email"
                  value={
                    email
                  }
                  readOnly
                />

              </div>

            </label>


            {/* ROLE */}

            <label>

              Account Role

              <div className="profile-input">

                <ShieldCheck
                  size={19}
                />

                <input
                  type="text"
                  value={
                    role
                      .toUpperCase()
                  }
                  readOnly
                />

              </div>

            </label>


            {/* SAVE BUTTON */}

            <button
              type="button"
              className="save-profile-button"
              disabled={
                saving
              }
              onClick={
                saveProfile
              }
            >

              <Save
                size={18}
              />

              {
                saving
                  ? 'Saving...'
                  : 'Save Changes'
              }

            </button>

          </div>

        </div>

      </div>

    </Layout>
  )
}