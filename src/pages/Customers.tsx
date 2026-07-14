import { useEffect, useMemo, useState } from 'react'
import {
  Mail,
  Search,
  UserRound,
  Users,
} from 'lucide-react'

import { Layout } from '../components/Layout'
import { supabase } from '../lib/supabaseClient'

interface Customer {
  id: string
  full_name: string | null
  email: string
  role: string
  created_at: string | null
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, full_name, email, role, created_at'
      )
      .eq('role', 'customer')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Customer loading error:',
        error
      )

      setError(error.message)
      setCustomers([])
    } else {
      setCustomers(
        (data as Customer[]) ?? []
      )
    }

    setLoading(false)
  }

  const filteredCustomers = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase()

    if (!value) {
      return customers
    }

    return customers.filter(
      customer =>
        customer.full_name
          ?.toLowerCase()
          .includes(value) ||
        customer.email
          .toLowerCase()
          .includes(value)
    )
  }, [customers, search])

  return (
    <Layout
      title="Customers"
      eyebrow="ADMIN MANAGEMENT"
    >
      <div className="customer-page-header">
        <div>
          <h2>Customer Management</h2>

          <p>
            View all registered customer
            accounts.
          </p>
        </div>

        <div className="customer-search">
          <Search size={18} />

          <input
            type="text"
            value={search}
            placeholder="Search customer..."
            onChange={event =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>
      </div>

      <div className="customer-summary-card">
        <div className="customer-summary-icon">
          <Users size={26} />
        </div>

        <div>
          <span>
            REGISTERED CUSTOMERS
          </span>

          <strong>
            {customers.length}
          </strong>
        </div>
      </div>

      {loading ? (
        <div className="customer-state-card">
          Loading customers...
        </div>
      ) : error ? (
        <div className="customer-state-card error">
          <strong>
            Unable to load customers
          </strong>

          <p>{error}</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="customer-state-card">
          <Users size={42} />

          <h2>
            {search
              ? 'No matching customers'
              : 'No customers found'}
          </h2>

          <p>
            {search
              ? 'Try another customer name or email.'
              : 'Customer accounts will appear here after registration.'}
          </p>
        </div>
      ) : (
        <div className="customer-grid">
          {filteredCustomers.map(
            customer => (
              <article
                className="customer-card"
                key={customer.id}
              >
                <div className="customer-card-top">
                  <div className="customer-avatar">
                    <UserRound size={25} />
                  </div>

                  <span className="customer-role">
                    CUSTOMER
                  </span>
                </div>

                <h3>
                  {customer.full_name ||
                    'Customer'}
                </h3>

                <div className="customer-email">
                  <Mail size={15} />

                  <span>
                    {customer.email}
                  </span>
                </div>

                <div className="customer-card-footer">
                  <span>
                    Joined
                  </span>

                  <strong>
                    {customer.created_at
                      ? new Date(
                          customer.created_at
                        ).toLocaleDateString(
                          'en-IN'
                        )
                      : 'Not available'}
                  </strong>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </Layout>
  )
}