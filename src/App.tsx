import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import {
  AuthProvider,
} from './context/AuthContext'

import {
  ProtectedRoute,
} from './components/ProtectedRoute'

import {
  AdminRoute,
} from './components/AdminRoute'


// LOGIN PAGE

import {
  Login,
} from './pages/Login'


// ADMIN PAGES

import {
  Dashboard,
} from './pages/Dashboard'

import {
  Customers,
} from './pages/Customers'

import {
  Products,
} from './pages/Products'

import {
  Sales,
} from './pages/Sales'

import {
  Employees,
} from './pages/Employees'

import {
  Reports,
} from './pages/Reports'


// CUSTOMER PAGES

import {
  CustomerDashboard,
} from './pages/CustomerDashboard'

import {
  CustomerProducts,
} from './pages/CustomerProducts'

import {
  MyOrders,
} from './pages/MyOrders'


// NEW CUSTOMER PAGES

import {
  TrackOrder,
} from './pages/TrackOrder'

import {
  CustomerProfile,
} from './pages/CustomerProfile'

import {
  CustomerSupport,
} from './pages/CustomerSupport'


export default function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <Routes>


          {/* =========================
              LOGIN
          ========================= */}

          <Route
            path="/login"
            element={
              <Login />
            }
          />


          {/* =========================
              ADMIN ROUTES
          ========================= */}


          {/* ADMIN DASHBOARD */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>

                <AdminRoute>

                  <Dashboard />

                </AdminRoute>

              </ProtectedRoute>
            }
          />


          {/* ADMIN CUSTOMERS */}

          <Route
            path="/customers"
            element={
              <ProtectedRoute>

                <AdminRoute>

                  <Customers />

                </AdminRoute>

              </ProtectedRoute>
            }
          />


          {/* ADMIN PRODUCTS */}

          <Route
            path="/products"
            element={
              <ProtectedRoute>

                <AdminRoute>

                  <Products />

                </AdminRoute>

              </ProtectedRoute>
            }
          />


          {/* ADMIN SALES */}

          <Route
            path="/sales"
            element={
              <ProtectedRoute>

                <AdminRoute>

                  <Sales />

                </AdminRoute>

              </ProtectedRoute>
            }
          />


          {/* ADMIN EMPLOYEES */}

          <Route
            path="/employees"
            element={
              <ProtectedRoute>

                <AdminRoute>

                  <Employees />

                </AdminRoute>

              </ProtectedRoute>
            }
          />


          {/* ADMIN REPORTS */}

          <Route
            path="/reports"
            element={
              <ProtectedRoute>

                <AdminRoute>

                  <Reports />

                </AdminRoute>

              </ProtectedRoute>
            }
          />


          {/* =========================
              CUSTOMER ROUTES
          ========================= */}


          {/* CUSTOMER DASHBOARD */}

          <Route
            path="/customer"
            element={
              <ProtectedRoute>

                <CustomerDashboard />

              </ProtectedRoute>
            }
          />


          {/* CUSTOMER PRODUCTS */}

          <Route
            path="/customer/products"
            element={
              <ProtectedRoute>

                <CustomerProducts />

              </ProtectedRoute>
            }
          />


          {/* CUSTOMER MY ORDERS */}

          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute>

                <MyOrders />

              </ProtectedRoute>
            }
          />


          {/* CUSTOMER TRACK ORDER */}

          <Route
            path="/customer/track-order"
            element={
              <ProtectedRoute>

                <TrackOrder />

              </ProtectedRoute>
            }
          />


          {/* CUSTOMER PROFILE */}

          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute>

                <CustomerProfile />

              </ProtectedRoute>
            }
          />


          {/* CUSTOMER HELP AND SUPPORT */}

          <Route
            path="/customer/support"
            element={
              <ProtectedRoute>

                <CustomerSupport />

              </ProtectedRoute>
            }
          />


          {/* =========================
              DEFAULT ROUTES
          ========================= */}


          {/* HOME */}

          <Route
            path="/"
            element={
              <Navigate
                to="/customer"
                replace
              />
            }
          />


          {/* INVALID URL */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />


        </Routes>

      </AuthProvider>

    </BrowserRouter>
  )
}