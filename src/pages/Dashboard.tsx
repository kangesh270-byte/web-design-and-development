import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  BarChart3,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Layout } from '../components/Layout'
import { supabase } from '../lib/supabaseClient'

interface Product {
  id: string
  name: string
}

interface Order {
  id: string
  customer_id: string | null
  product_id: string | null
  quantity: number | null

  total_amount:
    | number
    | string
    | null

  total:
    | number
    | string
    | null

  status: string | null
  created_at: string | null

  product:
    | Product
    | Product[]
    | null
}

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role?: string | null
}

interface MonthlySale {
  month: string
  revenue: number
  orders: number
}

interface ProductSale {
  productId: string
  productName: string
  quantity: number
  revenue: number
  orders: number
}

const chartColors = [
  '#f5a623',
  '#4f9cff',
  '#52d6a4',
  '#a975ff',
  '#ff6b6b',
  '#2ed4d4',
  '#f973d2',
  '#facc15',
  '#38bdf8',
  '#fb923c',
]

export function Dashboard() {
  const [
    orders,
    setOrders,
  ] = useState<Order[]>([])

  const [
    profiles,
    setProfiles,
  ] = useState<Profile[]>([])

  const [
    productCount,
    setProductCount,
  ] = useState(0)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  async function loadDashboard() {
    setLoading(true)
    setError('')

    const [
      ordersResult,
      productsResult,
      profilesResult,
    ] = await Promise.all([
      supabase
        .from('orders')
        .select(`
          id,
          customer_id,
          product_id,
          quantity,
          total_amount,
          total,
          status,
          created_at,
          product:products(
            id,
            name
          )
        `)
        .order(
          'created_at',
          {
            ascending: false,
          }
        ),

      supabase
        .from('products')
        .select(
          'id',
          {
            count: 'exact',
            head: true,
          }
        ),

      supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role
        `),
    ])

    if (
      ordersResult.error
    ) {
      console.error(
        'Orders loading error:',
        ordersResult.error
      )

      setError(
        ordersResult.error.message
      )
    }

    if (
      productsResult.error
    ) {
      console.error(
        'Product count error:',
        productsResult.error
      )
    }

    if (
      profilesResult.error
    ) {
      console.error(
        'Profiles loading error:',
        profilesResult.error
      )
    }

    setOrders(
      (
        ordersResult.data as
          unknown as
          Order[]
      ) ?? []
    )

    setProfiles(
      (
        profilesResult.data as
          Profile[]
      ) ?? []
    )

    setProductCount(
      productsResult.count ??
        0
    )

    setLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  function getOrderAmount(
    order: Order
  ) {
    const totalAmount =
      Number(
        order.total_amount ??
          0
      )

    const oldTotal =
      Number(
        order.total ??
          0
      )

    if (
      Number.isFinite(
        totalAmount
      ) &&
      totalAmount > 0
    ) {
      return totalAmount
    }

    if (
      Number.isFinite(
        oldTotal
      ) &&
      oldTotal > 0
    ) {
      return oldTotal
    }

    return 0
  }

  function getStatus(
    status:
      | string
      | null
  ) {
    return (
      status ??
      'pending'
    ).toLowerCase()
  }

  const customers =
    useMemo(() => {
      return profiles.filter(
        profile =>
          (
            profile.role ??
            'customer'
          ).toLowerCase() !==
          'admin'
      )
    }, [profiles])

  const totalRevenue =
    useMemo(() => {
      return orders.reduce(
        (
          total,
          order
        ) => {
          const status =
            getStatus(
              order.status
            )

          if (
            status ===
            'cancelled'
          ) {
            return total
          }

          return (
            total +
            getOrderAmount(
              order
            )
          )
        },
        0
      )
    }, [orders])

  const pendingOrders =
    useMemo(() => {
      return orders.filter(
        order =>
          getStatus(
            order.status
          ) ===
          'pending'
      ).length
    }, [orders])

  const processedOrders =
    useMemo(() => {
      return orders.filter(
        order => {
          const status =
            getStatus(
              order.status
            )

          return (
            status ===
              'confirmed' ||
            status ===
              'processed' ||
            status ===
              'shipped' ||
            status ===
              'delivered'
          )
        }
      ).length
    }, [orders])

  const cancelledOrders =
    useMemo(() => {
      return orders.filter(
        order =>
          getStatus(
            order.status
          ) ===
          'cancelled'
      ).length
    }, [orders])

  const completionRate =
    orders.length > 0
      ? Math.round(
          (
            processedOrders /
            orders.length
          ) *
            100
        )
      : 0

  const monthlySales =
    useMemo<
      MonthlySale[]
    >(() => {
      const currentDate =
        new Date()

      const monthData =
        Array.from(
          {
            length: 6,
          },
          (
            _,
            index
          ) => {
            const date =
              new Date(
                currentDate
                  .getFullYear(),

                currentDate
                  .getMonth() -
                  (
                    5 -
                    index
                  ),

                1
              )

            return {
              key:
                `${date.getFullYear()}-` +
                `${date.getMonth()}`,

              month:
                date.toLocaleDateString(
                  'en-IN',
                  {
                    month:
                      'short',
                  }
                ),

              revenue: 0,

              orders: 0,
            }
          }
        )

      orders.forEach(
        order => {
          if (
            !order.created_at
          ) {
            return
          }

          if (
            getStatus(
              order.status
            ) ===
            'cancelled'
          ) {
            return
          }

          const orderDate =
            new Date(
              order.created_at
            )

          const key =
            `${orderDate.getFullYear()}-` +
            `${orderDate.getMonth()}`

          const currentMonth =
            monthData.find(
              item =>
                item.key ===
                key
            )

          if (
            currentMonth
          ) {
            currentMonth.revenue +=
              getOrderAmount(
                order
              )

            currentMonth.orders +=
              1
          }
        }
      )

      return monthData.map(
        month => ({
          month:
            month.month,

          revenue:
            month.revenue,

          orders:
            month.orders,
        })
      )
    }, [orders])

  const maximumMonthlyRevenue =
    Math.max(
      ...monthlySales.map(
        month =>
          month.revenue
      ),
      1
    )

  const productSales =
    useMemo<
      ProductSale[]
    >(() => {
      const salesMap =
        new Map<
          string,
          ProductSale
        >()

      orders.forEach(
        order => {
          if (
            !order.product_id
          ) {
            return
          }

          if (
            getStatus(
              order.status
            ) ===
            'cancelled'
          ) {
            return
          }

          const relation =
            Array.isArray(
              order.product
            )
              ? order
                  .product[0]
              : order.product

          const productName =
            relation?.name ??
            'Unknown Product'

          const current =
            salesMap.get(
              order.product_id
            ) ?? {
              productId:
                order.product_id,

              productName,

              quantity: 0,

              revenue: 0,

              orders: 0,
            }

          current.quantity +=
            Number(
              order.quantity ??
                1
            )

          current.revenue +=
            getOrderAmount(
              order
            )

          current.orders +=
            1

          salesMap.set(
            order.product_id,
            current
          )
        }
      )

      return Array.from(
        salesMap.values()
      )
        .sort(
          (
            first,
            second
          ) =>
            second.revenue -
            first.revenue
        )
        .slice(
          0,
          8
        )
    }, [orders])

  const topProduct =
    productSales[0]

  const totalUnits =
    productSales.reduce(
      (
        total,
        product
      ) =>
        total +
        product.quantity,
      0
    )

  function getCustomer(
    customerId:
      | string
      | null
  ) {
    return profiles.find(
      profile =>
        profile.id ===
        customerId
    )
  }

  function formatMoney(
    amount:
      | number
      | string
      | null
  ) {
    return Number(
      amount ??
        0
    ).toLocaleString(
      'en-IN',
      {
        maximumFractionDigits:
          2,
      }
    )
  }

  function formatDate(
    value:
      | string
      | null
  ) {
    if (!value) {
      return '-'
    }

    return new Date(
      value
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

  return (
    <Layout
      title="Dashboard"
      eyebrow="ADMIN MANAGEMENT"
    >

      <section className="admin-analytics-page">

        <header className="admin-analytics-header">

          <div>

            <h2>
              Sales Analytics
            </h2>

            <p>
              Track revenue,
              customer orders
              and business
              performance.
            </p>

          </div>

          <button
            type="button"
            onClick={
              loadDashboard
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

        {error && (

          <div className="analytics-error">

            {error}

          </div>

        )}

        <div className="analytics-stat-grid">

          <article className="analytics-stat-card">

            <div className="analytics-stat-icon revenue">

              <IndianRupee
                size={25}
              />

            </div>

            <div>

              <span>
                TOTAL REVENUE
              </span>

              <strong>

                {loading
                  ? '...'
                  : `₹${formatMoney(
                      totalRevenue
                    )}`}

              </strong>

              <small>
                Valid customer
                orders
              </small>

            </div>

          </article>

          <article className="analytics-stat-card">

            <div className="analytics-stat-icon orders">

              <ShoppingBag
                size={25}
              />

            </div>

            <div>

              <span>
                TOTAL ORDERS
              </span>

              <strong>

                {loading
                  ? '...'
                  : orders.length}

              </strong>

              <small>
                Orders received
              </small>

            </div>

          </article>

          <article className="analytics-stat-card">

            <div className="analytics-stat-icon customers">

              <Users
                size={25}
              />

            </div>

            <div>

              <span>
                CUSTOMERS
              </span>

              <strong>

                {loading
                  ? '...'
                  : customers.length}

              </strong>

              <small>
                Registered
                customers
              </small>

            </div>

          </article>

          <article className="analytics-stat-card">

            <div className="analytics-stat-icon products">

              <Package
                size={25}
              />

            </div>

            <div>

              <span>
                PRODUCTS
              </span>

              <strong>

                {loading
                  ? '...'
                  : productCount}

              </strong>

              <small>
                Available
                products
              </small>

            </div>

          </article>

        </div>

        <div className="analytics-main-grid">

          <article className="sales-chart-panel">

            <div className="analytics-panel-heading">

              <div>

                <span>
                  REVENUE REPORT
                </span>

                <h3>
                  Monthly Sales
                </h3>

              </div>

              <TrendingUp
                size={23}
              />

            </div>

            <div className="sales-chart">

              {monthlySales.map(
                month => {
                  const height =
                    month.revenue >
                    0
                      ? Math.max(
                          (
                            month.revenue /
                            maximumMonthlyRevenue
                          ) *
                            100,
                          8
                        )
                      : 3

                  return (

                    <div
                      className="sales-chart-item"
                      key={
                        month.month
                      }
                    >

                      <div className="sales-chart-value">

                        ₹

                        {month.revenue >
                        999
                          ? `${(
                              month.revenue /
                              1000
                            ).toFixed(
                              1
                            )}K`
                          : month.revenue}

                      </div>

                      <div className="sales-chart-track">

                        <div
                          className="sales-chart-bar"
                          style={{
                            height:
                              `${height}%`,
                          }}
                        />

                      </div>

                      <strong>

                        {
                          month.month
                        }

                      </strong>

                      <small>

                        {
                          month.orders
                        }{' '}
                        orders

                      </small>

                    </div>

                  )
                }
              )}

            </div>

          </article>

          <article className="order-status-panel">

            <div className="analytics-panel-heading">

              <div>

                <span>
                  ORDER REPORT
                </span>

                <h3>
                  Order Status
                </h3>

              </div>

              <ShoppingBag
                size={22}
              />

            </div>

            <div className="analytics-status-row">

              <div className="status-name">

                <div className="status-icon pending">

                  <Clock3
                    size={19}
                  />

                </div>

                <span>
                  Pending
                </span>

              </div>

              <strong>

                {
                  pendingOrders
                }

              </strong>

            </div>

            <div className="analytics-status-row">

              <div className="status-name">

                <div className="status-icon completed">

                  <CheckCircle2
                    size={19}
                  />

                </div>

                <span>
                  Processed
                </span>

              </div>

              <strong>

                {
                  processedOrders
                }

              </strong>

            </div>

            <div className="analytics-status-row">

              <div className="status-name">

                <div className="status-icon cancelled">

                  <XCircle
                    size={19}
                  />

                </div>

                <span>
                  Cancelled
                </span>

              </div>

              <strong>

                {
                  cancelledOrders
                }

              </strong>

            </div>

            <div className="completion-block">

              <div>

                <span>
                  Completion Rate
                </span>

                <strong>

                  {
                    completionRate
                  }%

                </strong>

              </div>

              <div className="completion-track">

                <div
                  className="completion-value"
                  style={{
                    width:
                      `${completionRate}%`,
                  }}
                />

              </div>

            </div>

          </article>

        </div>

        <article className="product-analytics-section">

          <div className="product-analytics-title">

            <div>

              <span>
                PRODUCT ANALYTICS
              </span>

              <h3>
                Product Sales
                Performance
              </h3>

              <p>
                Compare product
                revenue and units
                sold.
              </p>

            </div>

            <div className="analytics-title-icon">

              <BarChart3
                size={25}
              />

            </div>

          </div>

          {topProduct && (

            <div className="top-product-card">

              <div className="top-product-trophy">

                <Trophy
                  size={31}
                />

              </div>

              <div className="top-product-information">

                <span>
                  TOP SELLING
                  PRODUCT
                </span>

                <h2>

                  {
                    topProduct
                      .productName
                  }

                </h2>

                <p>
                  Best product
                  based on total
                  sales revenue.
                </p>

              </div>

              <div className="top-product-values">

                <div>

                  <small>
                    TOTAL REVENUE
                  </small>

                  <strong>

                    ₹
                    {formatMoney(
                      topProduct
                        .revenue
                    )}

                  </strong>

                </div>

                <div>

                  <small>
                    UNITS SOLD
                  </small>

                  <strong>

                    {
                      topProduct
                        .quantity
                    }

                  </strong>

                </div>

              </div>

            </div>

          )}

          {productSales.length ===
          0 ? (

            <div className="analytics-empty">

              New orders with
              product IDs will
              appear here.

            </div>

          ) : (

            <div className="twin-sales-graphs">

              <section className="analytics-graph-card">

                <div className="graph-card-heading">

                  <div>

                    <span>
                      REVENUE
                      ANALYSIS
                    </span>

                    <h3>
                      Product
                      Revenue
                    </h3>

                  </div>

                  <IndianRupee
                    size={23}
                  />

                </div>

                <div className="revenue-chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={
                        productSales
                      }
                      margin={{
                        top: 30,
                        right: 15,
                        left: 5,
                        bottom: 85,
                      }}
                    >

                      <defs>

                        <linearGradient
                          id="revenueGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >

                          <stop
                            offset="0%"
                            stopColor="#ffbd3c"
                          />

                          <stop
                            offset="100%"
                            stopColor="#d77d05"
                          />

                        </linearGradient>

                      </defs>

                      <CartesianGrid
                        strokeDasharray="5 5"
                        vertical={
                          false
                        }
                        stroke="rgba(148,163,184,0.13)"
                      />

                      <XAxis
                        dataKey="productName"
                        interval={0}
                        angle={-32}
                        textAnchor="end"
                        height={105}
                        tick={{
                          fill:
                            '#8295b4',

                          fontSize:
                            10,
                        }}
                        axisLine={
                          false
                        }
                        tickLine={
                          false
                        }
                      />

                      <YAxis
                        width={70}
                        tickFormatter={
                          value =>
                            `₹${(
                              Number(
                                value
                              ) /
                              1000
                            ).toFixed(
                              0
                            )}K`
                        }
                        tick={{
                          fill:
                            '#8295b4',

                          fontSize:
                            11,
                        }}
                        axisLine={
                          false
                        }
                        tickLine={
                          false
                        }
                      />

                      <Tooltip
                        cursor={{
                          fill:
                            'rgba(245,166,35,0.07)',
                        }}
                        contentStyle={{
                          background:
                            '#111d30',

                          border:
                            '1px solid #2a3b55',

                          borderRadius:
                            '12px',

                          color:
                            '#ffffff',
                        }}
                        formatter={(
                          value
                        ) => [
                          `₹${formatMoney(
                            Number(
                              value
                            )
                          )}`,

                          'Revenue',
                        ]}
                      />

                      <Bar
                        dataKey="revenue"
                        fill="url(#revenueGradient)"
                        radius={[
                          11,
                          11,
                          4,
                          4,
                        ]}
                        maxBarSize={
                          62
                        }
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </section>

              <section className="analytics-graph-card">

                <div className="graph-card-heading">

                  <div>

                    <span>
                      SALES
                      DISTRIBUTION
                    </span>

                    <h3>
                      Units Sold
                    </h3>

                  </div>

                  <ShoppingBag
                    size={23}
                  />

                </div>

                <div className="donut-chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <PieChart>

                      <Pie
                        data={
                          productSales
                        }
                        dataKey="quantity"
                        nameKey="productName"
                        cx="50%"
                        cy="43%"
                        innerRadius={
                          70
                        }
                        outerRadius={
                          108
                        }
                        paddingAngle={
                          4
                        }
                        cornerRadius={
                          8
                        }
                      >

                        {productSales.map(
                          (
                            product,
                            index
                          ) => (

                            <Cell
                              key={
                                product
                                  .productId
                              }
                              fill={
                                chartColors[
                                  index %
                                    chartColors.length
                                ]
                              }
                            />

                          )
                        )}

                      </Pie>

                      <Tooltip
                        contentStyle={{
                          background:
                            '#111d30',

                          border:
                            '1px solid #2a3b55',

                          borderRadius:
                            '12px',

                          color:
                            '#ffffff',
                        }}
                        formatter={(
                          value
                        ) => [
                          `${value} units`,

                          'Sold',
                        ]}
                      />

                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={
                          value => (

                            <span
                              style={{
                                color:
                                  '#a6b6cf',

                                fontSize:
                                  '11px',
                              }}
                            >

                              {
                                value
                              }

                            </span>

                          )
                        }
                      />

                    </PieChart>

                  </ResponsiveContainer>

                  <div className="donut-center-content">

                    <strong>

                      {
                        totalUnits
                      }

                    </strong>

                    <span>
                      UNITS SOLD
                    </span>

                  </div>

                </div>

              </section>

            </div>

          )}

        </article>

        <article className="recent-orders-panel">

          <div className="analytics-panel-heading">

            <div>

              <span>
                LATEST ACTIVITY
              </span>

              <h3>
                Recent Customer
                Orders
              </h3>

            </div>

          </div>

          <div className="analytics-table-wrapper">

            <table className="analytics-orders-table">

              <thead>

                <tr>

                  <th>
                    ORDER
                  </th>

                  <th>
                    CUSTOMER
                  </th>

                  <th>
                    PRODUCT
                  </th>

                  <th>
                    QUANTITY
                  </th>

                  <th>
                    AMOUNT
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    DATE
                  </th>

                </tr>

              </thead>

              <tbody>

                {orders
                  .slice(
                    0,
                    7
                  )
                  .map(
                    order => {
                      const customer =
                        getCustomer(
                          order.customer_id
                        )

                      const relation =
                        Array.isArray(
                          order.product
                        )
                          ? order
                              .product[0]
                          : order.product

                      const status =
                        getStatus(
                          order.status
                        )

                      return (

                        <tr
                          key={
                            order.id
                          }
                        >

                          <td>

                            <strong>

                              #
                              {order.id
                                .slice(
                                  0,
                                  8
                                )
                                .toUpperCase()}

                            </strong>

                          </td>

                          <td>

                            <strong>

                              {customer
                                ?.full_name ||
                                'Customer'}

                            </strong>

                            <small>

                              {customer
                                ?.email ||
                                ''}

                            </small>

                          </td>

                          <td>

                            {relation
                              ?.name ||
                              'Old order'}

                          </td>

                          <td>

                            {order.quantity ??
                              1}

                          </td>

                          <td>

                            <strong>

                              ₹
                              {formatMoney(
                                getOrderAmount(
                                  order
                                )
                              )}

                            </strong>

                          </td>

                          <td>

                            <span
                              className={
                                `analytics-status ${status}`
                              }
                            >

                              {
                                status
                              }

                            </span>

                          </td>

                          <td>

                            {formatDate(
                              order.created_at
                            )}

                          </td>

                        </tr>

                      )
                    }
                  )}

              </tbody>

            </table>

          </div>

        </article>

      </section>

    </Layout>
  )
}