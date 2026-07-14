import {
  CircleHelp,
  Mail,
  MessageCircle,
  Phone,
} from 'lucide-react'

import {
  Layout,
} from '../components/Layout'

export function CustomerSupport() {
  return (
    <Layout
      title="Help & Support"
      eyebrow="CUSTOMER PORTAL"
    >

      <div className="customer-feature-page">

        <div className="feature-page-heading">

          <div>

            <h2>
              How Can We Help?
            </h2>

            <p>
              Contact our support
              team for product,
              order or delivery
              assistance.
            </p>

          </div>

          <div className="feature-heading-icon">

            <CircleHelp
              size={27}
            />

          </div>

        </div>


        <div className="support-options-grid">

          <article className="support-option-card">

            <MessageCircle
              size={30}
            />

            <h3>
              WhatsApp Support
            </h3>

            <p>
              Chat with the
              support team for
              quick assistance.
            </p>

            <button
              type="button"
            >

              Start Chat

            </button>

          </article>


          <article className="support-option-card">

            <Mail
              size={30}
            />

            <h3>
              Email Support
            </h3>

            <p>
              Send your order
              questions through
              email.
            </p>

            <button
              type="button"
            >

              Send Email

            </button>

          </article>


          <article className="support-option-card">

            <Phone
              size={30}
            />

            <h3>
              Call Support
            </h3>

            <p>
              Speak directly with
              the customer support
              team.
            </p>

            <button
              type="button"
            >

              Call Now

            </button>

          </article>

        </div>

      </div>

    </Layout>
  )
}