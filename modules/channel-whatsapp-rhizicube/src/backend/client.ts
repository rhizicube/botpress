import { driver, methodCache, api } from '@rocket.chat/sdk'
import * as sdk from 'botpress/sdk'
import { asyncMiddleware, asyncMiddleware as asyncMw, BPRequest } from 'common/http'
import { Request, Response, NextFunction } from 'express'
import _ from 'lodash'

import { Config } from '../config'
import { Clients } from './typings'

type ChatRequest = BPRequest & {
  botId: string
  conversationId: string
}

const debug = DEBUG('channel-whatsapp-rhizicube')
const debugIncoming = debug.sub('incoming')
const debugOutgoing = debug.sub('outgoing')

const outgoingTypes = ['text', 'image', 'carousel', 'card', 'video']

const axios = require('axios')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

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

  // listen to messages  from Rhizicube.Chat
  async listen(x, botId) {
    const self = this
    const userId = x.threadId

    // Returns an existing user or create a new one with the specified keys
    await self.bp.users.getOrCreateUser('channel-whatsapp-rhizicube', userId, botId)
    const user = await self.bp.users.getOrCreateUser('channel-whatsapp-rhizicube', userId, botId)
    self.bp.events.sendEvent(
      self.bp.IO.Event({
        botId,
        channel: 'channel-whatsapp-rhizicube',
        direction: 'incoming',
        payload: { text: x.message, user_info: user },
        type: 'text',
        threadId: x.threadId,
        target: 'GENERAL'
      })
    )
  }

  isConnected() {
    return this.connected
  }

  // disconnect from Rhizicube.Chat
  async disconnect() {
    await driver.disconnect()
  }

  // send message from Botpress to Rhizicube.Chat
  async sendMessageToRocketChat(event) {
    if (event.payload.type) {
      const AuthToken = 'Auth'
      const user_phone_number = 'User call number'
      const phone_number_id = '114392358180996'
      const current_version = 'v17.0'
      const url = `https://graph.facebook.com/${current_version}/${phone_number_id}/messages`

      const myAction = async event => {
        let payload_data: {}

        if (event.payload.type === 'text') {
          payload_data = JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: `${user_phone_number}`,
            type: event.payload.type,
            text: { body: event.payload.text }
          })
        }

        if (event.payload.type === 'image') {
          payload_data = JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: `${user_phone_number}`,
            type: event.payload.type,
            image: { link: event.payload.image }
          })
        }

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${url}`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${AuthToken}`
          },
          data: payload_data ? payload_data : ''
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
      const configs = await this.bp.config.getModuleConfigForBot('channel-whatsapp-rhizicube', event.botId)

      return myAction(event)
    } else {
      console.log('recieveing....')
    }
  }

  // send messages from Botpress to Rhizicube.Chat
  async handleOutgoingEvent(event: sdk.IO.Event, next: sdk.IO.MiddlewareNextCallback) {
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
    description: 'Sends messages to Rhizicube.chat',
    direction: 'outgoing',
    handler: outgoingHandler,
    name: 'rhizicube.sendMessages',
    order: 100
  })

  async function outgoingHandler(event: sdk.IO.Event, next: sdk.IO.MiddlewareNextCallback) {
    if (event.channel !== 'channel-whatsapp-rhizicube') {
      return next()
    }
    const router = bp.http.createRouterForBot('channel-whatsapp-rhizicube', {
      checkAuthentication: false,
      enableJsonBodyParser: false,
      enableUrlEncoderBodyParser: false
    })
    const config = (await bp.config.getModuleConfigForBot('channel-whatsapp-rhizicube', event.botId, true)) as Config
    const bot = new RocketChatClient(bp, event.botId, config, router)
    const client: RocketChatClient = new RocketChatClient(bp, event.botId, config, router)
    if (!client) {
      return next()
    }
    return client.handleOutgoingEvent(event, next)
  }
}
