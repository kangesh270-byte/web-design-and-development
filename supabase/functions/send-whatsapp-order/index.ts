import {
  serve,
} from 'https://deno.land/std@0.224.0/http/server.ts'


/*
  CORS SETTINGS
*/

const corsHeaders = {

  'Access-Control-Allow-Origin':
    '*',

  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',

  'Access-Control-Allow-Methods':
    'POST, OPTIONS',

}


/*
  START EDGE FUNCTION
*/

serve(
  async request => {


    /*
      HANDLE BROWSER
      CORS REQUEST
    */

    if (
      request.method ===
      'OPTIONS'
    ) {

      return new Response(

        'ok',

        {

          headers:
            corsHeaders,

        }

      )

    }


    /*
      ALLOW POST
      REQUEST ONLY
    */

    if (
      request.method !==
      'POST'
    ) {

      return new Response(

        JSON.stringify({

          success:
            false,

          error:
            'Only POST requests are allowed.',

        }),

        {

          status:
            405,

          headers: {

            ...corsHeaders,

            'Content-Type':
              'application/json',

          },

        }

      )

    }


    try {


      /*
        RECEIVE ORDER
        INFORMATION
      */

      const requestBody =
        await request.json()


      console.log(

        'ORDER REQUEST RECEIVED'

      )


      console.log(

        'ORDER ID:',

        requestBody
          ?.orderId

      )


      const {

        orderId,

        customerName,

        customerPhone,

        customerEmail,

        deliveryAddress,

        productName,

        quantity,

        totalAmount,

      } = requestBody


      /*
        VALIDATE ORDER
        INFORMATION
      */

      if (
        !orderId ||
        !customerName ||
        !customerPhone ||
        !deliveryAddress ||
        !productName ||
        !totalAmount
      ) {

        console.error(

          'ORDER VALIDATION FAILED'

        )


        return new Response(

          JSON.stringify({

            success:
              false,

            error:
              'Required order information is missing.',

          }),

          {

            status:
              400,

            headers: {

              ...corsHeaders,

              'Content-Type':
                'application/json',

            },

          }

        )

      }


      /*
        GET WHATSAPP
        API DETAILS
        FROM SUPABASE
        SECRETS
      */

      const accessToken =

        Deno.env.get(

          'WHATSAPP_ACCESS_TOKEN'

        )


      const phoneNumberId =

        Deno.env.get(

          'WHATSAPP_PHONE_NUMBER_ID'

        )


      const adminWhatsAppNumber =

        Deno.env.get(

          'ADMIN_WHATSAPP_NUMBER'

        )


      /*
        CHECK SECRET
        AVAILABILITY

        SECRET VALUES
        ARE NOT LOGGED
      */

      console.log(

        'ACCESS TOKEN AVAILABLE:',

        Boolean(

          accessToken

        )

      )


      console.log(

        'PHONE NUMBER ID AVAILABLE:',

        Boolean(

          phoneNumberId

        )

      )


      console.log(

        'ADMIN NUMBER AVAILABLE:',

        Boolean(

          adminWhatsAppNumber

        )

      )


      if (
        !accessToken ||
        !phoneNumberId ||
        !adminWhatsAppNumber
      ) {

        throw new Error(

          'WhatsApp API authentication details are missing.'

        )

      }


      /*
        FORMAT ORDER
        TOTAL
      */

      const formattedAmount =

        Number(

          totalAmount

        ).toLocaleString(

          'en-IN',

          {

            minimumFractionDigits:
              2,

            maximumFractionDigits:
              2,

          }

        )


      /*
        CREATE WHATSAPP
        ORDER MESSAGE
      */

      const orderMessage = [


        '🛒 NEW ORDER - VANTAGE',


        '',


        `Order ID: ${orderId}`,


        '',


        'CUSTOMER DETAILS',


        `Name: ${customerName}`,


        `Phone: ${customerPhone}`,


        `Email: ${

          customerEmail ||

          'Not provided'

        }`,


        '',


        'ORDER DETAILS',


        `Product: ${productName}`,


        `Quantity: ${

          quantity ||

          1

        }`,


        `Total Amount: ₹${

          formattedAmount

        }`,


        '',


        'DELIVERY ADDRESS',


        deliveryAddress,


        '',


        'Order Status: PENDING',


      ].join(

        '\n'

      )


      /*
        META WHATSAPP
        API URL
      */

      const metaApiUrl =

        `https://graph.facebook.com/v23.0/${

          phoneNumberId

        }/messages`


      console.log(

        'SENDING MESSAGE TO META API'

      )


      console.log(

        'RECIPIENT:',

        adminWhatsAppNumber

      )


      /*
        SEND WHATSAPP
        MESSAGE
      */

      const metaResponse =

        await fetch(

          metaApiUrl,

          {

            method:
              'POST',


            headers: {


              Authorization:

                `Bearer ${

                  accessToken

                }`,


              'Content-Type':

                'application/json',


            },


            body:

              JSON.stringify({


                messaging_product:

                  'whatsapp',


                recipient_type:

                  'individual',


                to:

                  adminWhatsAppNumber,


                type:

                  'text',


                text: {


                  preview_url:

                    false,


                  body:

                    orderMessage,


                },


              }),


          }

        )


      /*
        READ META
        RESPONSE
      */

      const metaResult =

        await metaResponse

          .json()


      /*
        NEW DEBUG LOGS
      */

      console.log(

        'META STATUS:',

        metaResponse
          .status

      )


      console.log(

        'META RESPONSE:',

        JSON.stringify(

          metaResult

        )

      )


      /*
        META API
        ERROR
      */

      if (
        !metaResponse.ok
      ) {


        console.error(

          'META WHATSAPP API ERROR'

        )


        console.error(

          'META ERROR CODE:',

          metaResult
            ?.error
            ?.code ||

          'No error code'

        )


        console.error(

          'META ERROR TYPE:',

          metaResult
            ?.error
            ?.type ||

          'No error type'

        )


        console.error(

          'META ERROR MESSAGE:',

          metaResult
            ?.error
            ?.message ||

          'No error message'

        )


        throw new Error(

          metaResult
            ?.error
            ?.message ||

          'WhatsApp notification failed.'

        )

      }


      /*
        META MESSAGE
        ACCEPTED
      */

      const whatsappMessageId =

        metaResult

          ?.messages

          ?.[0]

          ?.id ||

        null


      console.log(

        'WHATSAPP MESSAGE ACCEPTED'

      )


      console.log(

        'WHATSAPP MESSAGE ID:',

        whatsappMessageId

      )


      /*
        SUCCESS RESPONSE
      */

      return new Response(

        JSON.stringify({

          success:
            true,

          message:
            'WhatsApp order notification sent successfully.',

          whatsappMessageId,

          metaStatus:

            metaResponse
              .status,

        }),

        {

          status:
            200,

          headers: {

            ...corsHeaders,

            'Content-Type':
              'application/json',

          },

        }

      )


    } catch (
      error
    ) {


      /*
        FUNCTION ERROR
      */

      console.error(

        'SEND WHATSAPP ORDER ERROR:'

      )


      console.error(

        error

      )


      return new Response(

        JSON.stringify({

          success:
            false,

          error:

            error instanceof Error

              ? error.message

              : 'An unexpected error occurred.',

        }),

        {

          status:
            500,

          headers: {

            ...corsHeaders,

            'Content-Type':
              'application/json',

          },

        }

      )

    }

  }

)