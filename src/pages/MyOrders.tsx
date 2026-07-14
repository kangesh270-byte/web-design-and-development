import {
  useEffect,
  useState,
} from 'react'

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  XCircle,
} from 'lucide-react'

import {
  Layout,
} from '../components/Layout'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabaseClient'

interface Order {
  id: string

  quantity:
    number | null

  total_amount:
    number | string | null

  status:
    string | null

  created_at:
    string | null
}

export function MyOrders() {
  const {
    profile,
  } = useAuth()

  const [
    orders,
    setOrders,
  ] = useState<Order[]>([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  async function loadOrders() {
    if (!profile?.id) {
      setLoading(false)

      return
    }

    setLoading(true)

    setError('')

    const {
      data,
      error,
    } = await supabase
      .from('orders')
      .select(
        `
          id,
          quantity,
          total_amount,
          status,
          created_at
        `
      )
      .eq(
        'customer_id',
        profile.id
      )
      .order(
        'created_at',
        {
          ascending: false,
        }
      )

    if (error) {
      console.error(
        'My orders error:',
        error
      )

      setError(
        error.message
      )

      setOrders([])
    } else {
      setOrders(
        (
          data as Order[]
        ) ?? []
      )
    }

    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [profile?.id])

  const totalOrders =
    orders.length

  const pendingOrders =
    orders.filter(
      order =>
        (
          order.status ??
          'pending'
        ).toLowerCase() ===
        'pending'
    ).length

  const completedOrders =
    orders.filter(
      order => {
        const status =
          (
            order.status ??
            ''
          ).toLowerCase()

        return (
          status ===
            'confirmed' ||
          status ===
            'shipped' ||
          status ===
            'delivered'
        )
      }
    ).length

  const totalSpent =
    orders.reduce(
      (
        total,
        order
      ) =>
        total +
        Number(
          order.total_amount ??
          0
        ),
      0
    )

  function formatAmount(
    amount:
      number | string | null
  ) {
    return Number(
      amount ?? 0
    ).toLocaleString(
      'en-IN'
    )
  }

  function formatDate(
    date:
      string | null
  ) {
    if (!date) {
      return 'Date unavailable'
    }

    return new Date(
      date
    ).toLocaleDateString(
      'en-IN',
      {
        day:
          '2-digit',

        month:
          'short',

        year:
          'numeric',
      }
    )
  }

  function getStatusIcon(
    status:
      string | null
  ) {
    switch (
      (
        status ??
        'pending'
      ).toLowerCase()
    ) {
      case 'confirmed':
        return (
          <CheckCircle2
            size={16}
          />
        )

      case 'shipped':
        return (
          <Truck
            size={16}
          />
        )

      case 'delivered':
        return (
          <CheckCircle2
            size={16}
          />
        )

      case 'cancelled':
        return (
          <XCircle
            size={16}
          />
        )

      default:
        return (
          <Clock3
            size={16}
          />
        )
    }
  }

  return (
    <Layout
      title="My Orders"
      eyebrow="CUSTOMER PORTAL"
    >
      <section className="my-orders-page">

        <header className="my-orders-header">
          <div>
            <h2>
              Order History
            </h2>

            <p>
              View your orders,
              payment amount and
              latest order status.
            </p>
          </div>

          <button
            type="button"
            className="my-orders-refresh"
            onClick={
              loadOrders
            }
            disabled={
              loading
            }
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? 'spin'
                  : ''
              }
            />

            Refresh
          </button>
        </header>

        <div className="my-orders-stats">

          <article className="my-order-stat">
            <div className="my-order-stat-icon">
              <ShoppingBag
                size={23}
              />
            </div>

            <div>
              <span>
                TOTAL ORDERS
              </span>

              <strong>
                {
                  totalOrders
                }
              </strong>
            </div>
          </article>

          <article className="my-order-stat">
            <div className="my-order-stat-icon pending">
              <Clock3
                size={23}
              />
            </div>

            <div>
              <span>
                PENDING
              </span>

              <strong>
                {
                  pendingOrders
                }
              </strong>
            </div>
          </article>

          <article className="my-order-stat">
            <div className="my-order-stat-icon completed">
              <CheckCircle2
                size={23}
              />
            </div>

            <div>
              <span>
                PROCESSED
              </span>

              <strong>
                {
                  completedOrders
                }
              </strong>
            </div>
          </article>

          <article className="my-order-stat">
            <div className="my-order-stat-icon amount">
              <IndianRupee
                size={23}
              />
            </div>

            <div>
              <span>
                TOTAL VALUE
              </span>

              <strong>
                ₹{
                  totalSpent
                    .toLocaleString(
                      'en-IN'
                    )
                }
              </strong>
            </div>
          </article>

        </div>

        {loading ? (
          <div className="my-orders-state">
            <RefreshCw
              className="spin"
              size={35}
            />

            <h3>
              Loading your
              orders...
            </h3>
          </div>
        ) : error ? (
          <div className="my-orders-state error">
            <XCircle
              size={38}
            />

            <h3>
              Unable to load
              orders
            </h3>

            <p>
              {error}
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="my-orders-state">
            <Package
              size={45}
            />

            <h3>
              No orders yet
            </h3>

            <p>
              Place your first
              mobile order from
              the Products page.
            </p>
          </div>
        ) : (
          <div className="my-orders-grid">
            {orders.map(
              (
                order,
                index
              ) => {
                const status =
                  (
                    order.status ??
                    'pending'
                  ).toLowerCase()

                return (
                  <article
                    className="my-order-card"
                    key={
                      order.id
                    }
                  >
                    <div className="my-order-card-top">
                      <div className="my-order-number">
                        <div>
                          <Package
                            size={21}
                          />
                        </div>

                        <span>
                          <small>
                            ORDER
                          </small>

                          <strong>
                            #
                            {
                              order.id
                                .slice(
                                  0,
                                  8
                                )
                                .toUpperCase()
                            }
                          </strong>
                        </span>
                      </div>

                      <div
                        className={
                          `my-order-status ${status}`
                        }
                      >
                        {
                          getStatusIcon(
                            status
                          )
                        }

                        {
                          status
                            .charAt(
                              0
                            )
                            .toUpperCase() +
                          status
                            .slice(
                              1
                            )
                        }
                      </div>
                    </div>

                    <div className="my-order-divider" />

                    <div className="my-order-details">

                      <div>
                        <span>
                          ORDER NUMBER
                        </span>

                        <strong>
                          {
                            index +
                            1
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          QUANTITY
                        </span>

                        <strong>
                          {
                            order.quantity ??
                            1
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          AMOUNT
                        </span>

                        <strong className="my-order-amount">
                          ₹{
                            formatAmount(
                              order.total_amount
                            )
                          }
                        </strong>
                      </div>

                    </div>

                    <div className="my-order-date">
                      <CalendarDays
                        size={16}
                      />

                      Ordered on
                      {' '}
                      {
                        formatDate(
                          order.created_at
                        )
                      }
                    </div>
                  </article>
                )
              }
            )}
          </div>
        )}
      </section>
    </Layout>
  )
}