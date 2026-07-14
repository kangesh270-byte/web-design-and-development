import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  Loader2,
  Mail,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShoppingCart,
  User,
  X,
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


interface Product {
  id: string

  name: string

  price:
    number |
    string

  category:
    string |
    null

  brand:
    string |
    null

  description:
    string |
    null

  image_url:
    string |
    null

  specifications:
    Record<
      string,
      string | number
    > |
    null

  launch_year:
    number |
    null

  sku:
    string |
    null

  stock_quantity:
    number

  is_active:
    boolean
}


const PRODUCTS_PER_PAGE =
  50


const categories = [
  {
    label:
      'All Products',

    value:
      'all',
  },

  {
    label:
      'Laptops',

    value:
      'laptop',
  },

  {
    label:
      'Mobiles',

    value:
      'mobile',
  },

  {
    label:
      'Laptop Accessories',

    value:
      'laptop_accessory',
  },

  {
    label:
      'Mobile Accessories',

    value:
      'mobile_accessory',
  },
]


function getCategoryLabel(
  category:
    string |
    null
) {
  switch (
    category
  ) {
    case 'laptop':
      return 'Laptop'

    case 'mobile':
      return 'Mobile'

    case 'laptop_accessory':
      return 'Laptop Accessory'

    case 'mobile_accessory':
      return 'Mobile Accessory'

    default:
      return 'Electronics'
  }
}


/*
  CHANGE DATABASE
  SPECIFICATION KEYS
  INTO USER-FRIENDLY
  FEATURE LABELS
*/

function formatFeatureName(
  feature:
    string
) {
  const customLabels:
    Record<
      string,
      string
    > = {

    maximum_power:
      'Maximum Charging Power',

    output_port:
      'Output Port',

    fast_charging:
      'Fast Charging',

    recommended_for:
      'Recommended Devices',

    cable_included:
      'Cable Included',

    charging_technology:
      'Charging Technology',

    power_delivery:
      'Power Delivery',

    input_voltage:
      'Input Voltage',

    maximum_output:
      'Maximum Output',

    charging_ports:
      'Charging Ports',

    two_way_type_c:
      'Two-Way Type-C Charging',

    multiple_device_charging:
      'Multiple Device Charging',

    battery_type:
      'Battery Type',

    safety_features:
      'Safety Features',

    battery_capacity:
      'Battery Capacity',

    connection:
      'Connection',

    wireless_range:
      'Wireless Range',

    sensor_resolution:
      'Sensor Resolution',

    battery_life:
      'Battery Life',

    special_feature:
      'Special Feature',

    multi_device_support:
      'Multi-Device Support',

    device_switching:
      'Device Switching',

    storage_capacity:
      'Storage Capacity',

    maximum_read_speed:
      'Maximum Read Speed',

    maximum_write_speed:
      'Maximum Write Speed',

    memory_card_support:
      'Memory Card Support',

    hdmi_output:
      'HDMI Output',

    usb_ports:
      'USB Ports',

    total_playback:
      'Total Playback',

    charging_port:
      'Charging Port',

    low_latency_mode:
      'Low-Latency Mode',

    water_resistance:
      'Water Resistance',

    operating_system:
      'Operating System',

    compatible_devices:
      'Compatible Devices',

  }


  if (
    customLabels[
      feature
    ]
  ) {
    return customLabels[
      feature
    ]
  }


  return feature
    .replace(
      /_/g,
      ' '
    )
    .replace(
      /\b\w/g,

      letter =>

        letter
          .toUpperCase()
    )
}


export function CustomerProducts() {
  const {
    profile,
  } = useAuth()


  const [
    products,
    setProducts,
  ] = useState<
    Product[]
  >([])


  const [
    loading,
    setLoading,
  ] = useState(
    true
  )


  const [
    error,
    setError,
  ] = useState('')


  const [
    searchQuery,
    setSearchQuery,
  ] = useState('')


  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(
    'all'
  )


  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)


  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<
    Product |
    null
  >(null)


  const [
    fullName,
    setFullName,
  ] = useState('')


  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState('')


  const [
    email,
    setEmail,
  ] = useState('')


  const [
    deliveryAddress,
    setDeliveryAddress,
  ] = useState('')


  const [
    quantity,
    setQuantity,
  ] = useState(1)


  const [
    placingOrder,
    setPlacingOrder,
  ] = useState(
    false
  )


  const [
    successProduct,
    setSuccessProduct,
  ] = useState<
    Product |
    null
  >(null)


  const [
    successTotal,
    setSuccessTotal,
  ] = useState(0)


  /*
    LOAD ACTIVE PRODUCTS
  */

  useEffect(() => {
    loadProducts()
  }, [])


  /*
    LOAD CUSTOMER
    PROFILE DETAILS
  */

  useEffect(() => {
    if (
      profile
    ) {
      setFullName(
        profile
          .full_name ||
        ''
      )

      setEmail(
        profile
          .email ||
        ''
      )
    }
  }, [
    profile,
  ])


  /*
    RESET PAGE
  */

  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchQuery,
    selectedCategory,
  ])


  /*
    LOAD PRODUCTS
  */

  async function loadProducts() {
    setLoading(
      true
    )

    setError('')


    try {
      const {
        data,

        error:
          productError,
      } = await supabase
        .from(
          'products'
        )
        .select(`
          id,
          name,
          price,
          category,
          brand,
          description,
          image_url,
          specifications,
          launch_year,
          sku,
          stock_quantity,
          is_active
        `)
        .eq(
          'is_active',
          true
        )
        .in(
          'category',
          [
            'laptop',
            'mobile',
            'laptop_accessory',
            'mobile_accessory',
          ]
        )
        .order(
          'name',
          {
            ascending:
              true,
          }
        )


      if (
        productError
      ) {
        console.error(
          'Product loading error:',
          productError
        )


        setError(
          productError
            .message
        )


        setProducts([])


        return
      }


      setProducts(
        (
          data as
          Product[]
        ) || []
      )

    } catch (
      unexpectedError
    ) {
      console.error(
        'Product loading error:',
        unexpectedError
      )


      setError(
        'Unable to load products. Please try again.'
      )


      setProducts([])

    } finally {
      setLoading(
        false
      )
    }
  }


  /*
    FILTER PRODUCTS
  */

  const filteredProducts =
    useMemo(
      () => {

        const search =
          searchQuery
            .trim()
            .toLowerCase()


        return products
          .filter(
            product => {

              const
                matchesCategory =

                selectedCategory ===
                  'all' ||

                product
                  .category ===
                  selectedCategory


              const
                matchesSearch =

                search === '' ||

                product
                  .name
                  .toLowerCase()
                  .includes(
                    search
                  ) ||

                (
                  product
                    .brand ||
                  ''
                )
                  .toLowerCase()
                  .includes(
                    search
                  ) ||

                (
                  product
                    .sku ||
                  ''
                )
                  .toLowerCase()
                  .includes(
                    search
                  )


              return (
                matchesCategory &&
                matchesSearch
              )
            }
          )

      },

      [
        products,
        searchQuery,
        selectedCategory,
      ]
    )


  /*
    PAGINATION
  */

  const totalPages =
    Math.max(
      1,

      Math.ceil(
        filteredProducts
          .length /

        PRODUCTS_PER_PAGE
      )
    )


  const
    startProductIndex =

    (
      currentPage -
      1
    ) *

    PRODUCTS_PER_PAGE


  const
    endProductIndex =

    Math.min(
      startProductIndex +
      PRODUCTS_PER_PAGE,

      filteredProducts
        .length
    )


  const
    paginatedProducts =

    filteredProducts
      .slice(
        startProductIndex,
        endProductIndex
      )


  function goToPreviousPage() {
    setCurrentPage(
      current =>
        Math.max(
          1,
          current - 1
        )
    )


    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    })
  }


  function goToNextPage() {
    setCurrentPage(
      current =>
        Math.min(
          totalPages,
          current + 1
        )
    )


    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    })
  }


  /*
    OPEN CHECKOUT
  */

  function openCheckout(
    product:
      Product
  ) {
    if (
      product
        .stock_quantity <=
      0
    ) {
      alert(
        'This product is currently out of stock.'
      )

      return
    }


    setSelectedProduct(
      product
    )


    setQuantity(1)


    setPhoneNumber('')


    setDeliveryAddress('')


    setFullName(
      profile
        ?.full_name ||
      ''
    )


    setEmail(
      profile
        ?.email ||
      ''
    )
  }


  function closeCheckout() {
    if (
      placingOrder
    ) {
      return
    }


    setSelectedProduct(
      null
    )
  }


  function decreaseQuantity() {
    setQuantity(
      current =>
        Math.max(
          1,
          current - 1
        )
    )
  }


  function increaseQuantity() {
    if (
      !selectedProduct
    ) {
      return
    }


    setQuantity(
      current =>
        Math.min(
          selectedProduct
            .stock_quantity,

          current + 1
        )
    )
  }


  /*
    PLACE ORDER
  */

  async function placeOrder(
    event:
      FormEvent
  ) {
    event
      .preventDefault()


    if (
      !selectedProduct
    ) {
      return
    }


    if (
      !profile?.id
    ) {
      alert(
        'Customer profile not found. Please logout and login again.'
      )

      return
    }


    const
      currentProduct =

      selectedProduct


    const
      productPrice =

      Number(
        currentProduct
          .price
      )


    if (
      !Number.isFinite(
        productPrice
      ) ||

      productPrice <=
      0
    ) {
      alert(
        'Product price is invalid.'
      )

      return
    }


    if (
      quantity >
      currentProduct
        .stock_quantity
    ) {
      alert(
        `Only ${
          currentProduct
            .stock_quantity
        } item(s) are available.`
      )

      return
    }


    if (
      fullName
        .trim()
        .length <
      3
    ) {
      alert(
        'Enter your full name.'
      )

      return
    }


    const cleanPhone =

      phoneNumber
        .replace(
          /\D/g,
          ''
        )


    if (
      cleanPhone
        .length <
      10
    ) {
      alert(
        'Enter a valid phone number.'
      )

      return
    }


    if (
      !email
        .trim()
        .includes('@')
    ) {
      alert(
        'Enter a valid email address.'
      )

      return
    }


    if (
      deliveryAddress
        .trim()
        .length <
      10
    ) {
      alert(
        'Enter your complete delivery address.'
      )

      return
    }


    setPlacingOrder(
      true
    )


    try {
      const {
        data:
          latestProduct,

        error:
          productError,
      } = await supabase
        .from(
          'products'
        )
        .select(`
          id,
          price,
          stock_quantity,
          is_active
        `)
        .eq(
          'id',
          currentProduct
            .id
        )
        .single()


      if (
        productError ||
        !latestProduct
      ) {
        alert(
          'Unable to verify this product.'
        )

        return
      }


      if (
        !latestProduct
          .is_active
      ) {
        alert(
          'This product is no longer available.'
        )

        await loadProducts()

        return
      }


      if (
        latestProduct
          .stock_quantity <
        quantity
      ) {
        alert(
          `Only ${
            latestProduct
              .stock_quantity
          } item(s) are available.`
        )

        await loadProducts()

        return
      }


      const
        verifiedTotal =

        Number(
          latestProduct
            .price
        ) *

        quantity


      const {
        data:
          orderData,

        error:
          orderError,
      } = await supabase
        .from(
          'orders'
        )
        .insert({

          customer_id:
            profile.id,

          product_id:
            currentProduct
              .id,

          quantity,

          total_amount:
            verifiedTotal,

          total:
            verifiedTotal,

          status:
            'pending',

        })
        .select(
          'id'
        )
        .single()


      if (
        orderError
      ) {
        alert(
          `Order failed: ${
            orderError
              .message
          }`
        )

        return
      }


      const {
        data:
          whatsappData,

        error:
          whatsappError,
      } = await supabase
        .functions
        .invoke(
          'send-whatsapp-order',

          {
            body: {

              orderId:
                orderData.id,

              customerName:
                fullName
                  .trim(),

              customerPhone:
                cleanPhone,

              customerEmail:
                email
                  .trim(),

              deliveryAddress:
                deliveryAddress
                  .trim(),

              productName:
                currentProduct
                  .name,

              quantity,

              totalAmount:
                verifiedTotal,

            },
          }
        )


      if (
        whatsappError
      ) {
        console.error(
          'WhatsApp error:',
          whatsappError
        )

        alert(
          'Order saved successfully, but WhatsApp notification failed.'
        )

      } else if (
        !whatsappData
          ?.success
      ) {
        console.error(
          'WhatsApp response:',
          whatsappData
        )
      }


      setSuccessProduct(
        currentProduct
      )


      setSuccessTotal(
        verifiedTotal
      )


      setSelectedProduct(
        null
      )


      setPhoneNumber('')


      setDeliveryAddress('')


      setQuantity(1)


      await loadProducts()

    } catch (
      unexpectedError
    ) {
      console.error(
        unexpectedError
      )


      alert(
        'Something went wrong. Please try again.'
      )

    } finally {
      setPlacingOrder(
        false
      )
    }
  }


  return (

    <Layout

      title="Products"

      eyebrow=
        "CUSTOMER PORTAL"

    >

      <div className=
        "customer-products-page"
      >


        <div className=
          "customer-products-header"
        >

          <div>

            <h2>
              Available Products
            </h2>


            <p>

              Explore laptops,
              mobiles and original
              accessories with
              detailed product
              features.

            </p>

          </div>


          <div className=
            "product-count"
          >

            <Package
              size={18}
            />


            <span>

              {
                products
                  .length
              }

              {' '}

              Products

            </span>

          </div>

        </div>


        <div className=
          "product-filter-row"
        >


          <div className=
            "customer-product-search"
          >

            <Search
              size={20}
            />


            <input

              type="search"

              value={
                searchQuery
              }

              placeholder=
                "Search product, brand or SKU..."

              onChange={
                event =>

                  setSearchQuery(
                    event
                      .target
                      .value
                  )
              }

            />


            {
              searchQuery && (

                <button

                  type="button"

                  onClick={() =>

                    setSearchQuery(
                      ''
                    )
                  }

                >

                  <X
                    size={18}
                  />

                </button>

              )
            }

          </div>


          <div className=
            "product-category-filter"
          >

            <Package
              size={19}
            />


            <select

              value={
                selectedCategory
              }

              onChange={
                event =>

                  setSelectedCategory(
                    event
                      .target
                      .value
                  )
              }

            >

              {
                categories
                  .map(

                  category => (

                    <option

                      key={
                        category
                          .value
                      }

                      value={
                        category
                          .value
                      }

                    >

                      {
                        category
                          .label
                      }

                    </option>

                  )

                )
              }

            </select>

          </div>

        </div>


        {
          loading ? (

            <div className=
              "product-page-state"
            >

              <Loader2

                className=
                  "spin"

                size={35}

              />


              <h3>

                Loading
                products...

              </h3>

            </div>

          ) : error ? (

            <div className=
              "product-page-state"
            >

              <h3>

                Unable to
                load products

              </h3>


              <p>
                {error}
              </p>

            </div>

          ) :

          filteredProducts
            .length ===
            0 ? (

            <div className=
              "product-page-state"
            >

              <Search
                size={40}
              />


              <h3>

                No matching
                products

              </h3>

            </div>

          ) : (

            <>

              <div className=
                "customer-products-grid"
              >

                {
                  paginatedProducts
                    .map(

                    product => {

                      const price =

                        Number(
                          product
                            .price
                        )


                      const inStock =

                        product
                          .stock_quantity >
                        0


                      return (

                        <article

                          className=
                            "customer-product-card"

                          key={
                            product.id
                          }

                        >


                          <div className=
                            "product-icon-box"
                          >

                            <Package
                              size={29}
                            />

                          </div>


                          <span className=
                            "product-category"
                          >

                            {
                              getCategoryLabel(
                                product
                                  .category
                              )
                            }

                          </span>


                          <h3>

                            {
                              product
                                .name
                            }

                          </h3>


                          {
                            product
                              .brand && (

                              <p>

                                Brand:

                                {' '}

                                <strong>

                                  {
                                    product
                                      .brand
                                  }

                                </strong>

                              </p>

                            )
                          }


                          {
                            product
                              .description && (

                              <p className=
                                "product-description"
                              >

                                {
                                  product
                                    .description
                                }

                              </p>

                            )
                          }


                          {
                            product
                              .specifications &&

                            Object.keys(
                              product
                                .specifications
                            )
                              .length >
                            0 && (

                              <div className=
                                "product-features"
                              >

                                <h4>

                                  Key Features

                                </h4>


                                <div className=
                                  "product-features-list"
                                >

                                  {
                                    Object
                                      .entries(
                                        product
                                          .specifications
                                      )
                                      .slice(
                                        0,
                                        5
                                      )
                                      .map(

                                      (
                                        [
                                          key,
                                          value,
                                        ]
                                      ) => (

                                        <div

                                          className=
                                            "product-feature-item"

                                          key={
                                            key
                                          }

                                        >

                                          <CheckCircle2
                                            size={15}
                                          />


                                          <span>

                                            <strong>

                                              {
                                                formatFeatureName(
                                                  key
                                                )
                                              }:

                                            </strong>


                                            {' '}


                                            {
                                              String(
                                                value
                                              )
                                            }

                                          </span>

                                        </div>

                                      )

                                    )
                                  }

                                </div>

                              </div>

                            )
                          }


                          <div className=
                            "customer-product-price"
                          >

                            <IndianRupee
                              size={18}
                            />


                            <strong>

                              {
                                price
                                  .toLocaleString(
                                    'en-IN',

                                    {
                                      minimumFractionDigits:
                                        2,

                                      maximumFractionDigits:
                                        2,
                                    }
                                  )
                              }

                            </strong>

                          </div>


                          <p className=
                            "product-availability"
                          >

                            {
                              inStock

                              ? `${
                                  product
                                    .stock_quantity
                                } available in stock`

                              : 'Out of stock'
                            }

                          </p>


                          <button

                            type="button"

                            className=
                              "place-order-button"

                            disabled={
                              !inStock
                            }

                            onClick={() =>

                              openCheckout(
                                product
                              )
                            }

                          >

                            <ShoppingCart
                              size={18}
                            />


                            {
                              inStock

                              ? 'Place Order'

                              : 'Out of Stock'
                            }

                          </button>

                        </article>

                      )

                    }

                  )
                }

              </div>


              {
                totalPages >
                1 && (

                  <div className=
                    "product-pagination"
                  >

                    <button

                      type="button"

                      disabled={
                        currentPage ===
                        1
                      }

                      onClick={
                        goToPreviousPage
                      }

                    >

                      <ChevronLeft
                        size={18}
                      />

                      Previous

                    </button>


                    <div>

                      Page

                      {' '}

                      {
                        currentPage
                      }

                      {' '}

                      of

                      {' '}

                      {
                        totalPages
                      }

                    </div>


                    <button

                      type="button"

                      disabled={
                        currentPage ===
                        totalPages
                      }

                      onClick={
                        goToNextPage
                      }

                    >

                      Next

                      <ChevronRight
                        size={18}
                      />

                    </button>

                  </div>

                )
              }

            </>

          )
        }

      </div>


      {
        selectedProduct && (

          <div className=
            "checkout-overlay"
          >

            <div className=
              "checkout-modal"
            >


              <div className=
                "checkout-header"
              >

                <div>

                  <span>
                    CHECKOUT
                  </span>


                  <h2>

                    Delivery
                    Details

                  </h2>

                </div>


                <button

                  type="button"

                  onClick={
                    closeCheckout
                  }

                >

                  <X
                    size={25}
                  />

                </button>

              </div>


              <div className=
                "checkout-product"
              >

                <Package
                  size={30}
                />


                <div>

                  <strong>

                    {
                      selectedProduct
                        .name
                    }

                  </strong>


                  <span>

                    ₹

                    {
                      Number(
                        selectedProduct
                          .price
                      )
                        .toLocaleString(
                          'en-IN'
                        )
                    }

                  </span>

                </div>

              </div>


              <form

                className=
                  "checkout-form"

                onSubmit={
                  placeOrder
                }

              >


                <label>

                  Full Name


                  <div className=
                    "checkout-input"
                  >

                    <User
                      size={20}
                    />


                    <input

                      required

                      value={
                        fullName
                      }

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


                <label>

                  Phone Number


                  <div className=
                    "checkout-input"
                  >

                    <Phone
                      size={20}
                    />


                    <input

                      required

                      type="tel"

                      value={
                        phoneNumber
                      }

                      onChange={
                        event =>

                          setPhoneNumber(
                            event
                              .target
                              .value
                          )
                      }

                    />

                  </div>

                </label>


                <label>

                  Email


                  <div className=
                    "checkout-input"
                  >

                    <Mail
                      size={20}
                    />


                    <input

                      required

                      type="email"

                      value={
                        email
                      }

                      onChange={
                        event =>

                          setEmail(
                            event
                              .target
                              .value
                          )
                      }

                    />

                  </div>

                </label>


                <label>

                  Delivery Address


                  <div className=
                    "checkout-input checkout-address"
                  >

                    <MapPin
                      size={20}
                    />


                    <textarea

                      required

                      value={
                        deliveryAddress
                      }

                      onChange={
                        event =>

                          setDeliveryAddress(
                            event
                              .target
                              .value
                          )
                      }

                    />

                  </div>

                </label>


                <div className=
                  "checkout-quantity-row"
                >

                  <span>
                    Quantity
                  </span>


                  <div className=
                    "quantity-control"
                  >

                    <button

                      type="button"

                      onClick={
                        decreaseQuantity
                      }

                    >

                      <Minus
                        size={19}
                      />

                    </button>


                    <strong>

                      {
                        quantity
                      }

                    </strong>


                    <button

                      type="button"

                      onClick={
                        increaseQuantity
                      }

                    >

                      <Plus
                        size={19}
                      />

                    </button>

                  </div>

                </div>


                <div className=
                  "checkout-total"
                >

                  <span>

                    Total Amount

                  </span>


                  <strong>

                    ₹

                    {
                      (
                        Number(
                          selectedProduct
                            .price
                        ) *

                        quantity
                      )
                        .toLocaleString(
                          'en-IN'
                        )
                    }

                  </strong>

                </div>


                <button

                  type="submit"

                  className=
                    "checkout-place-order"

                  disabled={
                    placingOrder
                  }

                >

                  {
                    placingOrder

                    ? 'Placing Order...'

                    : 'Confirm Order'
                  }

                </button>

              </form>

            </div>

          </div>

        )
      }


      {
        successProduct && (

          <div className=
            "checkout-overlay"
          >

            <div className=
              "order-success-modal"
            >

              <CheckCircle2
                size={65}
              />


              <h2>

                Order Placed!

              </h2>


              <p>

                Your order for

                {' '}

                <strong>

                  {
                    successProduct
                      .name
                  }

                </strong>

                {' '}

                was placed
                successfully.

              </p>


              <strong>

                ₹

                {
                  successTotal
                    .toLocaleString(
                      'en-IN'
                    )
                }

              </strong>


              <button

                type="button"

                className=
                  "continue-shopping-button"

                onClick={() =>

                  setSuccessProduct(
                    null
                  )
                }

              >

                Continue Shopping

              </button>

            </div>

          </div>

        )
      }

    </Layout>

  )
}