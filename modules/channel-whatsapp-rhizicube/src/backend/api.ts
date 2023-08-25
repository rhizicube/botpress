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
  const router = bp.http.createRouterForBot('channel-whatsapp-rhizicube', {
    checkAuthentication: false,
    enableJsonBodyParser: true
  })
  bp.logger.info('router:', router)
  router.use(bodyParser.json())
  const api = async (respThreadId, messages) => {
    const currentTime = Math.floor(Date.now() / 1000)
    const apiResponse = { threadId: respThreadId, message: messages, createdAt: currentTime }
    return apiResponse
  }

  router.get('/', (req, res) => {
    console.log('/')
    res.status(200).send('Server has setup')
  })

  router.get('/testing', async (req, res) => {
    console.log('/testing')
    res.send({ Hello: 'Testing' })
  })

  // Sets server port and logs message on success

  router.post('/webhook', async (req, res) => {
    if (req.body.object) {
      if (
        req.body.entry &&
        req.body.entry[0].changes &&
        req.body.entry[0].changes[0] &&
        req.body.entry[0].changes[0].value.messages &&
        req.body.entry[0].changes[0].value.messages[0]
      ) {
        const phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id
        const from = req.body.entry[0].changes[0].value.messages[0].from
        const msg_body = req.body.entry[0].changes[0].value.messages[0].text.body
        const threadID = from
        const apiResponse = await api(threadID, msg_body)
        void listenCallback(apiResponse)
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
}
