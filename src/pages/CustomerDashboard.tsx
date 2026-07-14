import {
  useEffect,
  useState,
} from 'react'

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Package,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  Layout,
} from '../components/Layout'

import {
  StatCard,
} from '../components/StatCard'

import {
  useAuth,
} from '../context/AuthContext'

import {
  supabase,
} from '../lib/supabaseClient'

interface Order {
  id: string
  total_amount: number | string | null
  status: string | null
  created_at?: string
}

export function CustomerDashboard() {
  const {
    profile,
  } = useAuth()

  const navigate =
    useNavigate()

  const [
    products,
    setProducts,
  ] = useState(0)

  const [
    orders,
    setOrders,
  ] = useState(0)

  const [
    spent,
    setSpent,
  ] = useState(0)

  const [
    pendingOrders,
    setPendingOrders,
  ] = useState(0)

  const [
    completedOrders,
    setCompletedOrders,
  ] = useState(0)

  const [
    loading,
    setLoading,
  ] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      if (!profile?.id) {
        setLoading(false)
        return
      }

      setLoading(true)

      const {
        count: productCount,
        error: productError,
      } = await supabase
        .from('products')
        .select('*', {
          count: 'exact',
          head: true,
        })

      if (productError) {
        console.error(
          'Products error:',
          productError
        )
      }

      const {
        data: orderData,
        error: orderError,
      } = await supabase
        .from('orders')
        .select(
          'id, total_amount, status'
        )
        .eq(
          'customer_id',
          profile.id
        )

      if (orderError) {
        console.error(
          'Orders error:',
          orderError
        )
      }

      const customerOrders =
        (
          orderData as Order[]
        ) ?? []

      const totalSpent =
        customerOrders.reduce(
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

      const pending =
        customerOrders.filter(
          order =>
            (
              order.status ??
              'pending'
            ).toLowerCase() ===
            'pending'
        ).length

      const completed =
        customerOrders.filter(
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

      setProducts(
        productCount ?? 0
      )

      setOrders(
        customerOrders.length
      )

      setSpent(
        totalSpent
      )

      setPendingOrders(
        pending
      )

      setCompletedOrders(
        completed
      )

      setLoading(false)
    }

    loadDashboard()
  }, [profile?.id])

  return (
    <Layout
      title={`Welcome, ${
        profile?.full_name ||
        'Customer'
      }`}
      eyebrow="CUSTOMER PORTAL"
    >
      <section className="customer-dashboard-page">

        <div className="customer-dashboard-stats">
          <StatCard
            label="Available products"
            value={
              loading
                ? '...'
                : products.toString()
            }
            icon={
              <Package />
            }
          />

          <StatCard
            label="My orders"
            value={
              loading
                ? '...'
                : orders.toString()
            }
            icon={
              <ShoppingBag />
            }
          />

          <StatCard
            label="Total spent"
            value={
              loading
                ? '...'
                : `₹${spent.toLocaleString(
                    'en-IN'
                  )}`
            }
            icon={
              <IndianRupee />
            }
          />
        </div>

        <div className="customer-dashboard-content">

          <article className="customer-welcome-panel">
            <div>
              <span className="dashboard-panel-label">
                CUSTOMER PORTAL
              </span>

              <h2>
                Find your next
                mobile
              </h2>

              <p>
                Browse available
                mobiles, place your
                order and track the
                latest order status
                from your account.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/customer/products'
                  )
                }
              >
                <ShoppingCart
                  size={18}
                />

                Browse Products

                <ArrowRight
                  size={17}
                />
              </button>
            </div>

            <div className="welcome-package-icon">
              <Package
                size={65}
              />
            </div>
          </article>

          <article className="customer-order-summary">
            <div className="summary-heading">
              <div>
                <span className="dashboard-panel-label">
                  ORDER STATUS
                </span>

                <h2>
                  Order Summary
                </h2>
              </div>

              <ShoppingBag
                size={22}
              />
            </div>

            <div className="summary-status-row">
              <div className="summary-status-icon pending">
                <Clock3
                  size={21}
                />
              </div>

              <div>
                <span>
                  Pending
                </span>

                <strong>
                  {
                    pendingOrders
                  }
                </strong>
              </div>
            </div>

            <div className="summary-status-row">
              <div className="summary-status-icon completed">
                <CheckCircle2
                  size={21}
                />
              </div>

              <div>
                <span>
                  Processed
                </span>

                <strong>
                  {
                    completedOrders
                  }
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="view-orders-button"
              onClick={() =>
                navigate(
                  '/customer/orders'
                )
              }
            >
              View My Orders

              <ArrowRight
                size={16}
              />
            </button>
          </article>

        </div>
      </section>
    </Layout>
  )
}