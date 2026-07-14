import {
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Search,
  Truck,
} from 'lucide-react'

import {
  useState,
} from 'react'

import {
  Layout,
} from '../components/Layout'

export function TrackOrder() {
  const [
    orderNumber,
    setOrderNumber,
  ] = useState('')

  function handleTrackOrder() {
    if (
      !orderNumber.trim()
    ) {
      alert(
        'Please enter your order number.'
      )

      return
    }

    alert(
      `Searching order: ${orderNumber}`
    )
  }

  return (
    <Layout
      title="Track Order"
      eyebrow="CUSTOMER PORTAL"
    >

      <div className="customer-feature-page">

        <div className="feature-page-heading">

          <div>

            <h2>
              Track Your Order
            </h2>

            <p>
              Enter your order
              number to check the
              latest delivery
              status.
            </p>

          </div>

          <div className="feature-heading-icon">

            <MapPin
              size={27}
            />

          </div>

        </div>


        <div className="track-order-card">

          <div className="track-order-search">

            <Search
              size={21}
            />

            <input
              type="text"
              value={
                orderNumber
              }
              placeholder="Enter order number"
              onChange={
                event =>
                  setOrderNumber(
                    event.target.value
                  )
              }
            />

            <button
              type="button"
              onClick={
                handleTrackOrder
              }
            >

              Track Order

            </button>

          </div>


          <div className="order-tracking-preview">

            <div className="tracking-step tracking-completed">

              <div>

                <Package
                  size={22}
                />

              </div>

              <strong>
                Order Placed
              </strong>

              <span>
                Order received
              </span>

            </div>


            <div className="tracking-line" />


            <div className="tracking-step">

              <div>

                <Clock3
                  size={22}
                />

              </div>

              <strong>
                Processing
              </strong>

              <span>
                Preparing order
              </span>

            </div>


            <div className="tracking-line" />


            <div className="tracking-step">

              <div>

                <Truck
                  size={22}
                />

              </div>

              <strong>
                Shipped
              </strong>

              <span>
                On the way
              </span>

            </div>


            <div className="tracking-line" />


            <div className="tracking-step">

              <div>

                <CheckCircle2
                  size={22}
                />

              </div>

              <strong>
                Delivered
              </strong>

              <span>
                Order delivered
              </span>

            </div>

          </div>

        </div>

      </div>

    </Layout>
  )
}