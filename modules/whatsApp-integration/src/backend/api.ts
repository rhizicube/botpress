import axios from 'axios'
import * as sdk from 'botpress/sdk'
const bodyParser = require('body-parser')
const express = require('express'),
app = express()
const token = 'EAAMqZC1mdllcBAApraQ9SNvPTV8sFRZCk76yhTZBQIe1p57sXn2LGt1f3rbwDDLAJJZAYZA5oSHCgzlgTw0gEPAGXr2uDoZCGTezcksimUIeyfSVxJg5rTZAAwrszaXBwEiAaMkmieDdZCCcrqcDWU0xo3Wm8zDLzQTo1mHKX8zbwMZCAMSqmAATC'
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
// Imports dependencies and set up http server
const request = require('request')

  //app = express().use(body_parser.json()) // creates express http server

// Sets server port and logs message on success
// eslint-disable-next-line no-console
//app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'))
//const ph = [919599379011,918318083054]

export default async (bp: typeof sdk) => {
  /**
   * This is an example route to get you started.
   * Your API will be available at `http://localhost:3000/api/v1/bots/BOT_NAME/mod/whatsApp-integration`
   * Just replace BOT_NAME by your bot ID
   */
// 1)API to send text messages:-
 const axiosInstance = axios.create({
    baseURL: 'https://graph.facebook.com/v15.0/114392358180996',
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer EAAMqZC1mdllcBAAUoJN5uGbUuilRcRLJrcI1D2ZC4E58eVZCc8ctgNStmBbfRabZBpYqJHTRpB2B95CMcAhK4Q6HRw8beW3JjWMohp2rd4EakPxZB4xloUkmmFZCorebupj5x9GOvWWrly5UpTvXnc118qEF9dgKdMMXYQhm2CG9ZA5hWPe8JJJDlbG1CucICes7scdzG7cdgZDZD'
    }
   })
   //console.log(axiosInstance)
   axiosInstance.post('/messages',  {
    'messaging_product': 'whatsapp',
    'to': '919599379011',
     'text': {
        'preview_url': false,
        'body': 'Hello, its Rhizicube here'
    }

  // eslint-disable-next-line no-console
  }).then(({data}) => console.log('hello',data)).catch((error)=> console.log(error,'error'))



  /*//API to send text message with preview URL:-
  const axiosInstance = axios.create({
    baseURL: 'https://graph.facebook.com/v15.0/114392358180996',
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer EAAMqZC1mdllcBAH0IkxSlUd6P6wLDsNO4oZCDk1dsKZBVZAxD68QD3NwZBVcuzn31hmlmsFOxpVKBYfkvm6E2j2kn7TzUEs7SIZBYJwLT5MuX1yD7diq2AcX5MveZAKXbvwkTfRlTWP0YZCo9UILt3BxGM5MvRZCwULHxCUEup7flPxdrrI1v7CTcGTQdOXZBWrdenC7gzrSmtegZDZD'
    }
   })
   //console.log(axiosInstance)
   axiosInstance.post('/messages',  {
    'messaging_product': 'whatsapp',
    'recipient_type': 'individual',
    'to': '919599379011',
    'type': 'reaction',
    'reaction': {
        'message_id': 'wamid.HBgMOTE5NTk5Mzc5MDExFQIAERgSRkQ5NTI1QUVEREIxRkYyQkMwAA==',
        'emoji': '\uD83D\uDE00'
    }
// eslint-disable-next-line no-console
}).then(({data}) => console.log('hello',data)).catch((error)=> console.log(error,'error'))
  // eslint-disable-next-line no-console
*/

app.post('/webhook', (req, res) => {
  // Parse the request body from the POST
  let body = req.body

  // Check the Incoming webhook message
  console.log(JSON.stringify(req.body, null, 2))

  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id
      let from = req.body.entry[0].changes[0].value.messages[0].from // extract the phone number from the webhook payload
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body // extract the message text from the webhook payload
      axios({
        method: 'POST', // Required, HTTP method, a string, e.g. POST, GET
        url:
          'https://graph.facebook.com/v12.0/' +
          phone_number_id +
          '/messages?access_token=' +
          token,
        data: {
          messaging_product: 'whatsapp',
          to: from,
          text: { body: 'Ack: ' + msg_body },
        },
        headers: { 'Content-Type': 'application/json' },
      // eslint-disable-next-line no-console
      }).catch((err)=> console.log(err, 'error'))
    }
    res.sendStatus(200)
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404)
  }
})

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get('/webhook', (req, res) => {
  /*
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
  */
  const verify_token = 'hello'

  // Parse params from the webhook verification request
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      // eslint-disable-next-line no-console
      console.log('WEBHOOK_VERIFIED')
      res.status(200).send(challenge)
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403)
    }
  }
})

  const router = bp.http.createRouterForBot('whatsApp-integration')

  // Link to access this route: http://localhost:3000/api/v1/bots/BOT_NAME/mod/whatsApp-integration/my-first-route
  router.get('/my-first-route', async (req, res) => {
    // Since the bot ID is required to access your module,
    const botId = req.params.botId
    /*axios.POST(`
  https://graph.facebook.com/v15.0/114392358180996/messages `)
  -H 'Authorization: Bearer EAAMqZC1mdllcBADAC9BmsPjlTm2rxCxgCU9ZBO8Qt0sl1096fXl6aqXez94ZCGlsUR2m5pTXRU5oO5CGuaOTSZCJgdx1yAY0bWJXonjJroYEGmQIxDCZAFm6wjHnlAPZCaxdZCr45GbxSUr0bUnr48NkVia1Fy79hAo9MnVtcGrfosLEvIOuRGWBbJyJQFwU013AcFB5VysPAZDZD' `
  -H 'Content-Type: application/json' `
  -d '{ \"messaging_product\": \"whatsapp\", \"to\": \"919599379011\", \"type\": \"template\", \"template\": { \"name\": \"hello_world\", \"language\": { \"code\": \"en_US\" } } }'
*/

    /**
     * This is how you would get your module configuration for a specific bot.
     * If there is no configuration for the bot, global config will be used. Check `config.ts` to set your configurations
     */
    const config = await bp.config.getModuleConfigForBot('whatsApp-integration', botId)

    res.sendStatus(200)
  })
}
