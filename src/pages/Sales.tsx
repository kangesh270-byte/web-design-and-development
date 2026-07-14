import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Clock3,
  IndianRupee,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  XCircle,
} from 'lucide-react'

import { Layout } from '../components/Layout'
import { supabase } from '../lib/supabaseClient'

interface Order {
  id: string
  customer_id: string
  quantity: number
  total_amount: number
  status: string
  created_at: string
}

interface CustomerProfile {
  id: string
  full_name: string | null
  email: string
}

export function Sales() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<
    Record<string, CustomerProfile>
  >({})

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    setError('')

    const [
      orderResult,
      customerResult,
    ] = await Promise.all([
      supabase
        .from('orders')
        .select(
          'id, customer_id, quantity, total_amount, status, created_at'
        )
        .order('created_at', {
          ascending: false,
        }),

      supabase
        .from('profiles')
        .select(
          'id, full_name, email'
        )
        .eq('role', 'customer'),
    ])

    if (orderResult.error) {
      console.error(
        orderResult.error
      )

      setError(
        orderResult.error.message
      )

      setOrders([])
    } else {
      setOrders(
        (orderResult.data as Order[]) ??
          []
      )
    }

    if (!customerResult.error) {
      const profileMap: Record<
        string,
        CustomerProfile
      > = {}

      ;(
        (customerResult.data as CustomerProfile[]) ??
        []
      ).forEach(profile => {
        profileMap[profile.id] =
          profile
      })

      setCustomers(profileMap)
    }

    setLoading(false)
  }

  async function updateStatus(
    orderId: string,
    newStatus: string
  ) {
    setUpdatingId(orderId)

    const { error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
      })
      .eq('id', orderId)

    if (error) {
      alert(
        `Status update failed: ${error.message}`
      )
    } else {
      setOrders(currentOrders =>
        currentOrders.map(order =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      )
    }

    setUpdatingId('')
  }

  const filteredOrders =
    useMemo(() => {
      const value = search
        .trim()
        .toLowerCase()

      if (!value) {
        return orders
      }

      return orders.filter(
        order => {
          const customer =
            customers[
              order.customer_id
            ]

          return (
            order.id
              .toLowerCase()
              .includes(value) ||
            order.status
              .toLowerCase()
              .includes(value) ||
            customer?.full_name
              ?.toLowerCase()
              .includes(value) ||
            customer?.email
              .toLowerCase()
              .includes(value)
          )
        }
      )
    }, [
      orders,
      customers,
      search,
    ])

  const totalRevenue =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.total_amount ?? 0
        ),
      0
    )

  const pendingOrders =
    orders.filter(
      order =>
        order.status
          ?.toLowerCase() ===
        'pending'
    ).length

  return (
    <Layout
      title="Orders"
      eyebrow="ADMIN MANAGEMENT"
    >
      <div className="orders-header">
        <div>
          <h2>
            Customer Orders
          </h2>

          <p>
            View customer purchases and
            update delivery status.
          </p>
        </div>

        <div className="orders-header-actions">
          <div className="orders-search">
            <Search size={17} />

            <input
              value={search}
              placeholder="Search orders..."
              onChange={event =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          <button
            className="orders-refresh"
            onClick={loadOrders}
          >
            <RefreshCw size={17} />

            Refresh
          </button>
        </div>
      </div>

      <div className="order-stats">
        <div className="order-stat-card">
          <div className="order-stat-icon">
            <ShoppingBag size={22} />
          </div>

          <div>
            <span>
              TOTAL ORDERS
            </span>

            <strong>
              {orders.length}
            </strong>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="order-stat-icon">
            <Clock3 size={22} />
          </div>

          <div>
            <span>
              PENDING
            </span>

            <strong>
              {pendingOrders}
            </strong>
          </div>
        </div>

        <div className="order-stat-card">
          <div className="order-stat-icon">
            <IndianRupee size={22} />
          </div>

          <div>
            <span>
              ORDER VALUE
            </span>

            <strong>
              ₹
              {totalRevenue.toLocaleString(
                'en-IN'
              )}
            </strong>
          </div>
        </div>
      </div>

      <div className="admin-orders-panel">
        {loading ? (
          <div className="orders-empty">
            Loading customer orders...
          </div>
        ) : error ? (
          <div className="orders-empty">
            <XCircle size={35} />

            <h3>
              Unable to load orders
            </h3>

            <p>{error}</p>
          </div>
        ) : filteredOrders.length ===
          0 ? (
          <div className="orders-empty">
            <ShoppingBag size={38} />

            <h3>
              No orders found
            </h3>

            <p>
              Customer orders will
              appear here.
            </p>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>ORDER</th>

                  <th>CUSTOMER</th>

                  <th>QUANTITY</th>

                  <th>AMOUNT</th>

                  <th>DATE</th>

                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  order => {
                    const customer =
                      customers[
                        order
                          .customer_id
                      ]

                    return (
                      <tr key={order.id}>
                        <td>
                          <div className="order-id-cell">
                            <div>
                              <ShoppingBag
                                size={17}
                              />
                            </div>

                            <strong>
                              #
                              {order.id
                                .slice(
                                  0,
                                  8
                                )
                                .toUpperCase()}
                            </strong>
                          </div>
                        </td>

                        <td>
                          <div className="order-customer">
                            <div>
                              <UserRound
                                size={17}
                              />
                            </div>

                            <span>
                              <strong>
                                {customer
                                  ?.full_name ||
                                  'Customer'}
                              </strong>

                              <small>
                                {customer
                                  ?.email ||
                                  order
                                    .customer_id
                                    .slice(
                                      0,
                                      12
                                    )}
                              </small>
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="quantity-badge">
                            {
                              order.quantity
                            }
                          </span>
                        </td>

                        <td>
                          <strong>
                            ₹
                            {Number(
                              order
                                .total_amount
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </strong>
                        </td>

                        <td>
                          {new Date(
                            order.created_at
                          ).toLocaleDateString(
                            'en-IN'
                          )}
                        </td>

                        <td>
                          <select
                            className={`order-status-select ${
                              order.status ??
                              'pending'
                            }`}
                            value={
                              order.status ??
                              'pending'
                            }
                            disabled={
                              updatingId ===
                              order.id
                            }
                            onChange={event =>
                              updateStatus(
                                order.id,
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            <option value="pending">
                              Pending
                            </option>

                            <option value="confirmed">
                              Confirmed
                            </option>

                            <option value="shipped">
                              Shipped
                            </option>

                            <option value="delivered">
                              Delivered
                            </option>

                            <option value="cancelled">
                              Cancelled
                            </option>
                          </select>
                        </td>
                      </tr>
                    )
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}