import axios from 'axios'
import bodyParser from 'body-parser'
import * as sdk from 'botpress/sdk'
import { asyncMiddleware as asyncMw, StandardError } from 'common/http'
import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'


const token = 'hello'

// Imports dependencies and set up http server
const body_parser = require('body-parser')
const express = require('express')
const request = require('request')
const app = express().use(body_parser.json()) // creates express http server

type ListenCallback = (apiResponse: any) => Promise<void>
export default async (bp: typeof sdk, listenCallback: ListenCallback) => {
  const asyncMiddleware = asyncMw(bp.logger)
  const router = bp.http.createRouterForBot('channel-rocketchat', {
    checkAuthentication: false,
    enableJsonBodyParser: true
  })
  bp.logger.info('router:', router)
  router.use(bodyParser.json())
  const api = async (respThreadId, messages) => {
    // return new Promise((resolve, reject) => {
    const datas = {
      name: 'Rhizicube',
      job: 'AI',

    }

    try {
      const response = await axios({
        method: 'POST',
        url: 'https://reqres.in/api/users',
        data: datas,
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('API response:', response.data)
      const apiResponse = { ...response.data, threadId: respThreadId, message: messages }

      return apiResponse
    } catch (error) {
      console.log('API error:', error)
      throw error
    }

  }
  // )

  router.get('/', (req, res) => {
    console.log('/')
    res.status(200).send('Server has setup')
  })

  router.get('/testing', async (req, res) => {
    console.log('/testing')
    res.send({ Hello: 'Testing' })
  })

  // Sets server port and logs message on success

  router.post('/webhook', (req, res) => {
    // Parse the request body from the POST

    // Check the Incoming webhook message
    console.log('whatsapp receiving message...', JSON.stringify(req.body, null, 2))
    // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
    if (req.body.object) {
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0] &&
        req.body.entry[0].changes[0].value.messages &&
        req.body.entry[0].changes[0].value.messages[0]
      ) {
        const phone_number_id =
          req.body.entry[0].changes[0].value.metadata.phone_number_id
        const from = req.body.entry[0].changes[0].value.messages[0].from // extract the phone number from the webhook payload
        const msg_body = req.body.entry[0].changes[0].value.messages[0].text.body

        const myuuid = uuidv4()
        const threadID = myuuid + - + from
        const dataRec = {
          'messaging_product': 'whatsapp',
          'threadId': threadID,
          'message': msg_body
        }

        axios.post('http://localhost:3000/api/v1/bots/basic-bot-01/mod/channel-rocketchat/listen', dataRec)
          .then(response => console.log(response))
          .catch(error => {
            console.error('There was an error!', error)
          })
      }
      res.sendStatus(200)
    } else {
      // Return a '404 Not Found' if event is not from a WhatsApp API
      res.sendStatus(404)
    }
  })



  //Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
  //info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
  router.get('/webhook', (req, res) => {
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
     **/
    const verify_token = process.env.VERIFY_TOKEN

    // Parse params from the webhook verification request
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === 'subscribe' && token === verify_token) {
        // Respond with 200 OK and challenge token from the request
        console.log('WEBHOOK_VERIFIED')
        res.status(200).send(challenge)
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403)
      }
    }
  })

  router.post(
    '/listen',
    asyncMiddleware(async (req: Request, res: Response) => {
      try {
        const apiResponse = await api(req.body.threadId, req.body.message) // Call the API and wait for the response
        void listenCallback(apiResponse)
        res.sendStatus(201)

      } catch (error) {
        console.log('API error:', error)
        res.sendStatus(500)
      }
    })
  )
}
