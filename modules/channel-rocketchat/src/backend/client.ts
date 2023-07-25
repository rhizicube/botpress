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


const debug = DEBUG('channel-rocketchat')
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
  async listen(x, botId) {
    const self = this

    console.log('api response in listen: ', x)
    const userId = x.threadId

    // Returns an existing user or create a new one with the specified keys

    await self.bp.users.getOrCreateUser('channel-rocketchat', userId, botId) // Just to create the user if it doesn't exist
    const user = await self.bp.users.getOrCreateUser('channel-rocketchat', userId, botId)

    self.bp.events.sendEvent(
      self.bp.IO.Event({
        botId,
        channel: 'channel-rocketchat',
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

  // disconnect from Rocket.Chat
  async disconnect() {
    await driver.disconnect()
  }

  // send message from Botpress to Rocket.Chat
  async sendMessageToRocketChat(event) {

    if (event.payload.type) {

      const AuthToken = 'Auth'
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
      const configs = await this.bp.config.getModuleConfigForBot('channel-rocketchat', event.botId)

      return myAction(event)
    } else {
      console.log('recieveing....')
    }
  }

  // send messages from Botpress to Rocket.Chat
  async handleOutgoingEvent(event: sdk.IO.Event, next: sdk.IO.MiddlewareNextCallback) {
    // sending text

    if (event.type === 'typing') {
      //await this.rtm.sendTyping(event.threadId || event.target)
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

    const client: RocketChatClient = clients[event.botId]
    if (!client) {
      return next()
    }

    return client.handleOutgoingEvent(event, next)
  }
}
