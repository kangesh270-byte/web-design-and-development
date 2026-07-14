import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  AlertTriangle,
  Boxes,
  IndianRupee,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'

import {
  Layout,
} from '../components/Layout'

import {
  supabase,
} from '../lib/supabaseClient'

import type {
  Category,
  Product,
} from '../lib/types'


const empty = {
  name: '',
  category_id: '',
  price: '',
  cost: '',
  stock_quantity: '',
  reorder_level: '',
  supplier: '',
}


export function Products() {
  const [
    products,
    setProducts,
  ] = useState<
    Product[]
  >([])


  const [
    categories,
    setCategories,
  ] = useState<
    Category[]
  >([])


  const [
    loading,
    setLoading,
  ] = useState(
    true
  )


  const [
    query,
    setQuery,
  ] = useState('')


  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(
    'all'
  )


  const [
    modalOpen,
    setModalOpen,
  ] = useState(
    false
  )


  const [
    editing,
    setEditing,
  ] = useState<
    Product | null
  >(null)


  const [
    form,
    setForm,
  ] = useState(
    empty
  )


  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null)


  const [
    saving,
    setSaving,
  ] = useState(
    false
  )


  /*
    LOAD ONLY ACTIVE
    PRODUCTS AND
    ACTIVE CATEGORIES
  */

  async function load() {
    setLoading(
      true
    )


    const [
      productResult,
      categoryResult,
    ] =
      await Promise.all([

        supabase
          .from(
            'products'
          )
          .select(`
            *,
            category_details:
              categories(*)
          `)
          .eq(
            'is_active',
            true
          )
          .order(
            'created_at',
            {
              ascending:
                false,
            }
          ),


        supabase
          .from(
            'categories'
          )
          .select('*')
          .eq(
            'is_active',
            true
          )
          .order(
            'name',
            {
              ascending:
                true,
            }
          ),

      ])


    if (
      productResult
        .error
    ) {
      console.error(
        'Products error:',
        productResult
          .error
      )

      setProducts([])
    } else {
      setProducts(
        (
          productResult
            .data ??
          []
        ) as Product[]
      )
    }


    if (
      categoryResult
        .error
    ) {
      console.error(
        'Categories error:',
        categoryResult
          .error
      )

      setCategories([])
    } else {
      setCategories(
        categoryResult
          .data ??
        []
      )
    }


    setLoading(
      false
    )
  }


  useEffect(() => {
    load()
  }, [])


  /*
    SEARCH AND
    CATEGORY FILTER
  */

  const filtered =
    useMemo(
      () => {

        const search =
          query
            .trim()
            .toLowerCase()


        return products
          .filter(
            product => {

              const
                matchesSearch =

                product
                  .name
                  .toLowerCase()
                  .includes(
                    search
                  ) ||

                (
                  product
                    .supplier ??
                  ''
                )
                  .toLowerCase()
                  .includes(
                    search
                  )


              const
                matchesCategory =

                selectedCategory ===
                  'all' ||

                product
                  .category_id ===
                  selectedCategory


              return (
                matchesSearch &&
                matchesCategory
              )
            }
          )

      },

      [
        products,
        query,
        selectedCategory,
      ]
    )


  /*
    INVENTORY VALUE
  */

  const
    totalInventoryValue =

    useMemo(
      () => {

        return products
          .reduce(
            (
              total,
              product
            ) => {

              return (
                total +

                Number(
                  product
                    .price ??
                  0
                ) *

                Number(
                  product
                    .stock_quantity ??
                  0
                )
              )

            },

            0
          )

      },

      [
        products,
      ]
    )


  /*
    AVAILABLE PRODUCTS
  */

  const
    availableProducts =

    useMemo(
      () => {

        return products
          .filter(
            product =>

              Number(
                product
                  .stock_quantity
              ) >
              0
          )
          .length

      },

      [
        products,
      ]
    )


  /*
    LOW STOCK
  */

  const
    lowStockProducts =

    useMemo(
      () => {

        return products
          .filter(
            product => {

              const stock =
                Number(
                  product
                    .stock_quantity
                )


              const reorder =
                Number(
                  product
                    .reorder_level
                )


              return (
                stock >
                  0 &&

                stock <=
                  reorder
              )

            }
          )
          .length

      },

      [
        products,
      ]
    )


  /*
    OUT OF STOCK
  */

  const
    outOfStockProducts =

    useMemo(
      () => {

        return products
          .filter(
            product =>

              Number(
                product
                  .stock_quantity
              ) <=
              0
          )
          .length

      },

      [
        products,
      ]
    )


  /*
    OPEN NEW PRODUCT
  */

  function openNew() {
    setEditing(
      null
    )

    setForm(
      empty
    )

    setError(
      null
    )

    setModalOpen(
      true
    )
  }


  /*
    OPEN EDIT PRODUCT
  */

  function openEdit(
    product:
      Product
  ) {
    setEditing(
      product
    )


    setForm({

      name:
        product
          .name,


      category_id:
        product
          .category_id ??
        '',


      price:
        String(
          product
            .price ??
          0
        ),


      cost:
        String(
          product
            .cost ??
          0
        ),


      stock_quantity:
        String(
          product
            .stock_quantity ??
          0
        ),


      reorder_level:
        String(
          product
            .reorder_level ??
          0
        ),


      supplier:
        product
          .supplier ??
        '',

    })


    setError(
      null
    )


    setModalOpen(
      true
    )
  }


  /*
    CLOSE MODAL
  */

  function closeModal() {
    if (
      saving
    ) {
      return
    }


    setModalOpen(
      false
    )


    setEditing(
      null
    )


    setForm(
      empty
    )


    setError(
      null
    )
  }


  /*
    SAVE PRODUCT
  */

  async function handleSubmit(
    event:
      FormEvent
  ) {
    event
      .preventDefault()


    setError(
      null
    )


    setSaving(
      true
    )


    const payload = {

      name:
        form
          .name
          .trim(),


      category_id:
        form
          .category_id ||
        null,


      price:
        Number(
          form
            .price
        ),


      cost:
        Number(
          form
            .cost
        ),


      stock_quantity:
        Number(
          form
            .stock_quantity
        ),


      reorder_level:
        Number(
          form
            .reorder_level
        ),


      supplier:
        form
          .supplier
          .trim() ||
        null,


      is_active:
        true,

    }


    if (
      editing
    ) {

      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            'products'
          )
          .update(
            payload
          )
          .eq(
            'id',
            editing
              .id
          )


      if (
        updateError
      ) {

        setError(
          updateError
            .message
        )


        setSaving(
          false
        )


        return

      }

    } else {

      const {
        error:
          insertError,
      } =
        await supabase
          .from(
            'products'
          )
          .insert(
            payload
          )


      if (
        insertError
      ) {

        setError(
          insertError
            .message
        )


        setSaving(
          false
        )


        return

      }

    }


    setSaving(
      false
    )


    setModalOpen(
      false
    )


    setEditing(
      null
    )


    setForm(
      empty
    )


    setError(
      null
    )


    await load()
  }


  /*
    SAFE PRODUCT
    DEACTIVATION

    DO NOT DELETE
    OLD ORDERS
  */

  async function
  handleDeactivate(
    id:
      string
  ) {

    const confirmed =
      confirm(
        'Hide this product? Old orders and sales history will remain safe.'
      )


    if (
      !confirmed
    ) {
      return
    }


    const {
      error:
        deactivateError,
    } =
      await supabase
        .from(
          'products'
        )
        .update({
          is_active:
            false,
        })
        .eq(
          'id',
          id
        )


    if (
      deactivateError
    ) {

      alert(
        deactivateError
          .message
      )


      return

    }


    await load()
  }


  /*
    MONEY FORMAT
  */

  function money(
    amount:
      number |
      string
  ) {

    return Number(
      amount ??
      0
    )
      .toLocaleString(
        'en-IN'
      )

  }


  /*
    COMPACT MONEY
  */

  function compactMoney(
    amount:
      number
  ) {

    if (
      amount >=
      10000000
    ) {

      return (
        `₹${
          (
            amount /
            10000000
          )
            .toFixed(
              1
            )
        } Cr`
      )

    }


    if (
      amount >=
      100000
    ) {

      return (
        `₹${
          (
            amount /
            100000
          )
            .toFixed(
              1
            )
        } L`
      )

    }


    return (
      `₹${
        money(
          amount
        )
      }`
    )
  }


  /*
    STOCK TYPE
  */

  function getStockType(
    product:
      Product
  ) {

    const stock =
      Number(
        product
          .stock_quantity
      )


    const reorder =
      Number(
        product
          .reorder_level
      )


    if (
      stock <=
      0
    ) {
      return 'out'
    }


    if (
      stock <=
      reorder
    ) {
      return 'low'
    }


    return 'available'
  }


  return (

    <Layout

      eyebrow="INVENTORY"

      title="Products"

      action={

        <button

          className=
            "btn btn-primary"

          onClick={
            openNew
          }

        >

          <Plus
            size={17}
          />


          Add Product

        </button>

      }

    >

      <section className=
        "inventory-products-page"
      >


        <div className=
          "inventory-summary-grid"
        >


          <article className=
            "inventory-summary-card"
          >

            <div className=
              "inventory-summary-icon total"
            >

              <Boxes
                size={23}
              />

            </div>


            <div>

              <span>
                TOTAL PRODUCTS
              </span>


              <strong>

                {
                  products
                    .length
                }

              </strong>


              <small>

                Active products

              </small>

            </div>

          </article>


          <article className=
            "inventory-summary-card"
          >

            <div className=
              "inventory-summary-icon value"
            >

              <IndianRupee
                size={23}
              />

            </div>


            <div>

              <span>
                INVENTORY VALUE
              </span>


              <strong>

                {
                  compactMoney(
                    totalInventoryValue
                  )
                }

              </strong>


              <small>
                Price × stock
              </small>

            </div>

          </article>


          <article className=
            "inventory-summary-card"
          >

            <div className=
              "inventory-summary-icon available"
            >

              <Package
                size={23}
              />

            </div>


            <div>

              <span>
                AVAILABLE
              </span>


              <strong>

                {
                  availableProducts
                }

              </strong>


              <small>
                Products in stock
              </small>

            </div>

          </article>


          <article className=
            "inventory-summary-card"
          >

            <div className=
              "inventory-summary-icon warning"
            >

              <AlertTriangle
                size={23}
              />

            </div>


            <div>

              <span>
                STOCK ALERTS
              </span>


              <strong>

                {
                  lowStockProducts +
                  outOfStockProducts
                }

              </strong>


              <small>

                {
                  outOfStockProducts
                }

                {' '}

                out of stock

              </small>

            </div>

          </article>

        </div>


        <div className=
          "inventory-products-toolbar"
        >


          <div className=
            "inventory-search"
          >

            <Search
              size={17}
            />


            <input

              type="search"

              placeholder=
                "Search products or suppliers..."

              value={
                query
              }

              onChange={
                event =>

                  setQuery(
                    event
                      .target
                      .value
                  )
              }

            />

          </div>


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

            <option
              value="all"
            >

              All categories

            </option>


            {
              categories
                .map(
                  category => (

                    <option

                      key={
                        category
                          .id
                      }

                      value={
                        category
                          .id
                      }

                    >

                      {
                        category
                          .name
                      }

                    </option>

                  )
                )
            }

          </select>


          <div className=
            "inventory-result-count"
          >

            {
              filtered
                .length
            }

            {' '}

            products

          </div>

        </div>


        <div className=
          "inventory-products-panel"
        >

          <div className=
            "inventory-table-scroll"
          >

            <table className=
              "inventory-products-table"
            >

              <thead>

                <tr>

                  <th>
                    PRODUCT
                  </th>

                  <th>
                    CATEGORY
                  </th>

                  <th>
                    SELLING PRICE
                  </th>

                  <th>
                    COST
                  </th>

                  <th>
                    STOCK STATUS
                  </th>

                  <th>
                    SUPPLIER
                  </th>

                  <th>
                    ACTIONS
                  </th>

                </tr>

              </thead>


              <tbody>


                {
                  loading && (

                    <tr>

                      <td
                        colSpan={
                          7
                        }
                      >

                        <div className=
                          "inventory-empty"
                        >

                          Loading
                          products...

                        </div>

                      </td>

                    </tr>

                  )
                }


                {
                  !loading &&

                  filtered
                    .length ===
                    0 && (

                    <tr>

                      <td
                        colSpan={
                          7
                        }
                      >

                        <div className=
                          "inventory-empty"
                        >

                          <Package
                            size={
                              28
                            }
                          />


                          No active
                          products
                          found.

                        </div>

                      </td>

                    </tr>

                  )
                }


                {
                  !loading &&

                  filtered
                    .map(

                    product => {

                      const
                        stockType =

                        getStockType(
                          product
                        )


                      return (

                        <tr

                          key={
                            product
                              .id
                          }

                        >


                          <td>

                            <div className=
                              "inventory-product-name"
                            >


                              <div className=
                                "inventory-product-icon"
                              >

                                <Package
                                  size={
                                    18
                                  }
                                />

                              </div>


                              <div>

                                <strong>

                                  {
                                    product
                                      .name
                                  }

                                </strong>


                                <small>

                                  Product ID:

                                  {' '}

                                  {
                                    String(
                                      product
                                        .id
                                    )
                                      .slice(
                                        0,
                                        8
                                      )
                                      .toUpperCase()
                                  }

                                </small>

                              </div>

                            </div>

                          </td>


                          <td>

                            <span className=
                              "inventory-category"
                            >

                              {
                                (
                                  product as
                                  Product & {
                                    category_details?:
                                    {
                                      name?:
                                        string
                                    }
                                  }
                                )
                                  .category_details
                                  ?.name ||

                                'Uncategorized'
                              }

                            </span>

                          </td>


                          <td>

                            <strong className=
                              "inventory-price"
                            >

                              ₹

                              {
                                money(
                                  product
                                    .price
                                )
                              }

                            </strong>

                          </td>


                          <td>

                            ₹

                            {
                              money(
                                product
                                  .cost
                              )
                            }

                          </td>


                          <td>

                            <span

                              className={
                                `inventory-stock ${
                                  stockType
                                }`
                              }

                            >

                              {
                                stockType ===
                                  'out'

                                ? 'Out of stock'

                                : stockType ===
                                    'low'

                                ? `Low · ${
                                    product
                                      .stock_quantity
                                  } units`

                                : `${
                                    product
                                      .stock_quantity
                                  } units`
                              }

                            </span>

                          </td>


                          <td>

                            {
                              product
                                .supplier ||

                              'Not assigned'
                            }

                          </td>


                          <td>

                            <div className=
                              "inventory-actions"
                            >


                              <button

                                type="button"

                                title=
                                  "Edit product"

                                onClick={() =>

                                  openEdit(
                                    product
                                  )
                                }

                              >

                                <Pencil
                                  size={
                                    15
                                  }
                                />

                              </button>


                              <button

                                type="button"

                                className=
                                  "delete"

                                title=
                                  "Hide product"

                                onClick={() =>

                                  handleDeactivate(
                                    product
                                      .id
                                  )
                                }

                              >

                                <Trash2
                                  size={
                                    15
                                  }
                                />

                              </button>

                            </div>

                          </td>

                        </tr>

                      )

                    }

                  )
                }


              </tbody>

            </table>

          </div>

        </div>

      </section>


      {
        modalOpen && (

          <div

            className=
              "modal-overlay"

            onClick={
              closeModal
            }

          >

            <div

              className=
                "modal"

              onClick={
                event =>

                  event
                    .stopPropagation()
              }

            >


              <div className=
                "inventory-modal-header"
              >


                <div>

                  <span>

                    PRODUCT
                    MANAGEMENT

                  </span>


                  <h3>

                    {
                      editing

                      ? 'Edit Product'

                      : 'Add Product'
                    }

                  </h3>

                </div>


                <button

                  type="button"

                  className=
                    "btn btn-ghost"

                  onClick={
                    closeModal
                  }

                >

                  <X
                    size={17}
                  />

                </button>

              </div>


              <form

                onSubmit={
                  handleSubmit
                }

              >


                <div className=
                  "inventory-form-field"
                >

                  <label className=
                    "label"
                  >

                    Product name

                  </label>


                  <input

                    className=
                      "input"

                    required

                    value={
                      form
                        .name
                    }

                    onChange={
                      event =>

                        setForm({

                          ...form,

                          name:
                            event
                              .target
                              .value,

                        })
                    }

                  />

                </div>


                <div className=
                  "inventory-form-field"
                >

                  <label className=
                    "label"
                  >

                    Category

                  </label>


                  <select

                    className=
                      "input"

                    required

                    value={
                      form
                        .category_id
                    }

                    onChange={
                      event =>

                        setForm({

                          ...form,

                          category_id:
                            event
                              .target
                              .value,

                        })
                    }

                  >


                    <option
                      value=""
                    >

                      Select category

                    </option>


                    {
                      categories
                        .map(

                        category => (

                          <option

                            key={
                              category
                                .id
                            }

                            value={
                              category
                                .id
                            }

                          >

                            {
                              category
                                .name
                            }

                          </option>

                        )

                      )
                    }


                  </select>

                </div>


                <div className=
                  "inventory-form-grid"
                >


                  <div>

                    <label className=
                      "label"
                    >

                      Price (₹)

                    </label>


                    <input

                      className=
                        "input"

                      type=
                        "number"

                      min="0"

                      step=
                        "0.01"

                      required

                      value={
                        form
                          .price
                      }

                      onChange={
                        event =>

                          setForm({

                            ...form,

                            price:
                              event
                                .target
                                .value,

                          })
                      }

                    />

                  </div>


                  <div>

                    <label className=
                      "label"
                    >

                      Cost (₹)

                    </label>


                    <input

                      className=
                        "input"

                      type=
                        "number"

                      min="0"

                      step=
                        "0.01"

                      required

                      value={
                        form
                          .cost
                      }

                      onChange={
                        event =>

                          setForm({

                            ...form,

                            cost:
                              event
                                .target
                                .value,

                          })
                      }

                    />

                  </div>

                </div>


                <div className=
                  "inventory-form-grid"
                >


                  <div>

                    <label className=
                      "label"
                    >

                      Stock quantity

                    </label>


                    <input

                      className=
                        "input"

                      type=
                        "number"

                      min="0"

                      required

                      value={
                        form
                          .stock_quantity
                      }

                      onChange={
                        event =>

                          setForm({

                            ...form,

                            stock_quantity:
                              event
                                .target
                                .value,

                          })
                      }

                    />

                  </div>


                  <div>

                    <label className=
                      "label"
                    >

                      Reorder level

                    </label>


                    <input

                      className=
                        "input"

                      type=
                        "number"

                      min="0"

                      required

                      value={
                        form
                          .reorder_level
                      }

                      onChange={
                        event =>

                          setForm({

                            ...form,

                            reorder_level:
                              event
                                .target
                                .value,

                          })
                      }

                    />

                  </div>

                </div>


                <div className=
                  "inventory-form-field"
                >

                  <label className=
                    "label"
                  >

                    Supplier

                  </label>


                  <input

                    className=
                      "input"

                    value={
                      form
                        .supplier
                    }

                    placeholder=
                      "Supplier name"

                    onChange={
                      event =>

                        setForm({

                          ...form,

                          supplier:
                            event
                              .target
                              .value,

                        })
                    }

                  />

                </div>


                {
                  error && (

                    <div className=
                      "inventory-form-error"
                    >

                      {
                        error
                      }

                    </div>

                  )
                }


                <button

                  className=
                    "btn btn-primary"

                  type=
                    "submit"

                  disabled={
                    saving
                  }

                  style={{

                    width:
                      '100%',

                    justifyContent:
                      'center',

                  }}

                >

                  {
                    saving

                    ? 'Saving...'

                    : editing

                    ? 'Save Changes'

                    : 'Add Product'
                  }

                </button>

              </form>

            </div>

          </div>

        )
      }

    </Layout>

  )
}