import { driver, methodCache, api } from '@rocket.chat/sdk'
import * as sdk from 'botpress/sdk'
import { asyncMiddleware, asyncMiddleware as asyncMw, BPRequest } from 'common/http'
import { Request, Response, NextFunction } from 'express'
import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { Config } from '../config'
import { Clients } from './typings'

type ChatRequest = BPRequest & {
  botId: string
  conversationId: string

}

const debug = DEBUG('channel-rocketchat')
const debugIncoming = debug.sub('incoming')
const debugOutgoing = debug.sub('outgoing')

const outgoingTypes = ['text', 'image', 'carousel', 'card', 'video']

// Imports dependencies and set up http server
const axios = require('axios')
const bodyParser = require('body-parser')
const body_parser = require('body-parser')
const express = require('express')
const app = express().use(body_parser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const request = require('request')

const token = 'hello'
export class RocketChatClient {
  private interactive: any
  private logger: sdk.Logger
  private connection: any
  private user: any
  private roomList: any
  private roomsJoined: any
  private subscribed: any
  private connected: boolean

  constructor(private bp: typeof sdk, private botId: string, private config: Config, private router) {
    this.logger = bp.logger.forBot(botId)
    this.connected = false
  }

  async connect() {
    this.connected = false
    function handleChannel(channelList) {
      if (channelList !== undefined) {
        channelList = channelList.toLowerCase()
        if (channelList.match(',')) {
          channelList = channelList.split(',')
        } else if (channelList !== '') {
          channelList = [channelList]
        } else {
          channelList = []
        }
      }
      return channelList
    }

    try {
      // connect to Rocket.Chat server
      this.connection = await driver.connect({
        host: this.config.rocketChatUrl,
        useSsl: this.config.rocketChatUseSSL
      })
      // login as Rocket.Chat bot user
      this.user = await driver.login({
        username: this.config.rocketChatBotUser,
        password: this.config.rocketChatBotPassword
      })
      // join to Rocket.Chat rooms
      this.roomList = handleChannel(this.config.rocketChatRoom)
      this.roomsJoined = await driver.joinRooms(this.roomList)
      // subscribe to messages
      this.subscribed = await driver.subscribeToMessages()
      // sent greeting message to each room
      for (const room of this.roomList) {
        const sent = await driver.sendToRoom(this.config.rocketChatBotUser + ' is listening you ...', room)
      }
      this.connected = true
    } catch (error) {
      console.log(error)
    }
  }

  // listen to messages  from Rocket.Chat
  async listen(botId) {
    const self = this
    const router = self.bp.http.createRouterForBot('channel-rocketchat', {
      checkAuthentication: false,
      enableJsonBodyParser: true,
    })

    router.use(bodyParser.json())
    //Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
    //info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
    router.get('/webhook', (req, res) => {
      /**
       * UPDATE YOUR VERIFY TOKEN
       *This will be the Verify Token value when you set up webhook
       **/
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
          console.log('WEBHOOK_VERIFIED')
          res.status(200).send(challenge)
        } else {
          // Responds with '403 Forbidden' if verify tokens do not match
          res.sendStatus(403)
        }
      }
    })



    // Sets server port and logs message on success
    router.post('/webhook', async (req, res) => {

      // Check the Incoming webhook message
      console.log('whatsapp receiving message...', JSON.stringify(req.body, null, 2))

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

          const userId = from
          await self.bp.users.getOrCreateUser('channel-rocketchat', userId, botId) // Just to create the user if it doesn't exist
          const user = await self.bp.users.getOrCreateUser('channel-rocketchat', userId, botId)

          self.bp.events.sendEvent(
            self.bp.IO.Event({
              botId,
              channel: 'channel-rocketchat',
              direction: 'incoming',
              payload: { text: msg_body, user_info: user },
              type: 'text',
              threadId: threadID,
              target: 'GENERAL'
            })
          )
        }
        res.sendStatus(200)
      } else {
        // Return a '404 Not Found' if event is not from a WhatsApp API
        res.sendStatus(404)
      }
    })


    //Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
    //info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
    router.get('/webhook', async (req, res) => {
      /**
       * UPDATE YOUR VERIFY TOKEN
       *This will be the Verify Token value when you set up webhook
       **/
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
          console.log('WEBHOOK_VERIFIED')
          res.status(200).send(challenge)
        } else {
          // Responds with '403 Forbidden' if verify tokens do not match
          res.sendStatus(403)
        }
      }
    })

  }

  isConnected() {
    return this.connected
  }

  // disconnect from Rocket.Chat
  async disconnect() {
    await driver.disconnect()
  }

  // send message from Botpress to Rocket.Chat
  async sendMessageToRocketChat(event) {
    //console.log('event: ', event)
    const AuthToken = 'EAAMqZC1mdllcBAHjoXSKES3W8OhGVr46WXGNAGBh3MfomM9VJplf8mSDLXvC5ZAap4zGERbmL44jauZAUxPAyQqR7P1mPb9ZCQ4ypGs0it9lqDvRhnvcjZBHgl8IkCAWIplBFbjqYeObYbjZANcgJjGrMjLwIYNUTMh8KAipZBQL6yzZCpwb15fLiwcl6FCJNsc7rhBnyirXRCPNb73R1OF2z0W6RlAP70kZD'
    const user_phone_number = '919599379011'
    const phone_number_id = '114392358180996'
    const current_version = 'v17.0'
    const url = `https://graph.facebook.com/${current_version}/${phone_number_id}/messages`

    const myAction = async event => {

      let payload_data: {}

      if (event.payload.type === 'text') {
        payload_data = JSON.stringify({
          'messaging_product': 'whatsapp',
          'recipient_type': 'individual',
          'to': `${user_phone_number}`,
          type: event.payload.type,
          'text': { 'body': event.payload.text }
        })
      }

      if (event.payload.type === 'image') {
        payload_data = JSON.stringify({
          'messaging_product': 'whatsapp',
          'recipient_type': 'individual',
          'to': `${user_phone_number}`,
          type: event.payload.type,
          'image': { 'link': event.payload.image }
        })
      }

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `${url}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            `Bearer ${AuthToken}`
        },
        data: payload_data
      }

      const waRes = axios
        .request(config)
        .then(response => {
          console.log(JSON.stringify(response.data))
        })
        .catch(error => {
          console.log(error)
        })
      const currentData = waRes.data
      return currentData
    }
    const configs = await this.bp.config.getModuleConfigForBot('channel-rocketchat', event.botId)
    return myAction(event)
  }

  // send messages from Botpress to Rocket.Chat
  async handleOutgoingEvent(event: sdk.IO.Event, next: sdk.IO.MiddlewareNextCallback) {
    // sending text
    if (event.type === 'typing') {
      await new Promise(resolve => setTimeout(() => resolve(), 1000))
      return next(undefined, false)
    }

    const messageType = event.type === 'default' ? 'text' : event.type
    if (!_.includes(outgoingTypes, messageType)) {
      return next(new Error('Unsupported event type: ' + event.type))
    }

    await this.sendMessageToRocketChat(event)

    next(undefined, false)
  }
}

// setup Middleware to send outgoing message from Botpress to Rochet.Chat
export async function setupMiddleware(bp: typeof sdk, clients: Clients) {
  bp.events.registerMiddleware({
    description: 'Sends messages to Rocket.Chat',
    direction: 'outgoing',
    handler: outgoingHandler,
    name: 'rocketchat.sendMessages',
    order: 100
  })

  async function outgoingHandler(event: sdk.IO.Event, next: sdk.IO.MiddlewareNextCallback) {
    if (event.channel !== 'channel-rocketchat') {
      return next()
    }

    const messaging = bp.messaging.forBot(event.botId)
    console.log('messaging...', messaging)

    const messageType = event.type === 'default' ? 'text' : event.type
    console.log('messagingType...', messageType)

    const userId = event.target
    console.log('userId...', userId)

    const conversationId = event.threadId

    const client: RocketChatClient = clients[event.botId]
    if (!client) {
      return next()
    }

    return client.handleOutgoingEvent(event, next)
  }
}
