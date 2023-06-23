import { driver, methodCache, api } from '@rocket.chat/sdk'
//import Promise from "bluebird";

import * as sdk from 'botpress/sdk'
import { asyncMiddleware, asyncMiddleware as asyncMw, BPRequest } from 'common/http'
import { Request, Response, NextFunction } from 'express'
import _ from 'lodash'

import { Config } from '../config'
import { Clients } from './typings'
//import { respondToMessages } from './wa'
//import { respondToMessages } from './whatsapp'

const debug = DEBUG('channel-rocketchat')
const debugIncoming = debug.sub('incoming')
const debugOutgoing = debug.sub('outgoing')

const outgoingTypes = ['text', 'image', 'carousel', 'card']

const axios = require('axios')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// userCache = new LRU({ max: 1000, maxAge: ms('1h') })

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
    // split channe string
    function handleChannel(channelList) {
      if (channelList !== undefined) {
        //channelList = channelList.replace(/[^\w\,._]/gi, "").toLowerCase();
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
      //console.log('Connected to Rocket.Chat at ' + this.config.rocketChatUrl)
      // login as Rocket.Chat bot user
      this.user = await driver.login({
        username: this.config.rocketChatBotUser,
        password: this.config.rocketChatBotPassword
      })
      //console.log('Logged in Rocket.Chat as ' + this.config.rocketChatBotUser)
      // join to Rocket.Chat rooms
      this.roomList = handleChannel(this.config.rocketChatRoom)
      this.roomsJoined = await driver.joinRooms(this.roomList)
      //console.log('BOT User ' + this.config.rocketChatBotUser + ' joined rooms ' + this.config.rocketChatRoom)
      // subscribe to messages
      this.subscribed = await driver.subscribeToMessages()
      //console.log('subscribed to Rocket.Chat messages')
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
    //console.log('api response in listen: ', x)

    // Returns an existing user or create a new one with the specified keys
    // export function getOrCreateUser(channel: string, userId: string, botId?: string): GetOrCreateResult<User>

    const userId = 'GENERAL'
    const user = self.bp.users.getOrCreateUser('GENERAL', userId, botId)

    self.bp.events.sendEvent(
      self.bp.IO.Event({
        //id: message.ts.$date.toString(),
        botId,
        channel: 'channel-rocketchat',
        direction: 'incoming',
        payload: { text: x.name, user_info: user },
        type: 'text',
        // preview: message.msg,
        target: 'GENERAL'
      })
    )
    // Rocket.Chat receive function
    const receiveRocketChatMessages = async function(err, message, meta) {
      // eslint-disable-next-line no-console
      console.log('entering in try block')
      try {
        //console.log('calling listen api')
        if (!err) {
          // If message have .t so it's a system message, so ignore it
          if (message.t === undefined) {
            const userId = message.u._id
            const user = await self.bp.users.getOrCreateUser(message.rid, userId)

            debugIncoming('Receiving message %o', message)
            debugIncoming('User %o', user)
            // console.log('inside receiveRocketChatMessages')
            await self.bp.events.sendEvent(
              self.bp.IO.Event({
                //id: message.ts.$date.toString(),
                botId: self.botId,
                channel: 'rocketchat',
                direction: 'incoming',
                payload: { text: message.msg, user_info: user },
                type: 'text',
                preview: message.msg,
                target: message.rid
              })
            )
          }
        }
      } catch (error) {
        console.log(error)
      }
    }

    //console.log('calling callback function')
    const options = {
      dm: true,
      livechat: true,
      edited: true
    }
    // console.log('Listening to Rocket.Chat messages ... ')
    return driver.respondToMessages(receiveRocketChatMessages, options)
  }

  isConnected() {
    return this.connected
  }

  // disconnect from Rocket.Chat
  async disconnect() {
    await driver.disconnect()
  }

  // send message from Botpress to Rocket.Chat
  sendMessageToRocketChat(event) {
    //console.log('event: ', event)
    const AuthToken = 'wa auth token'
    const myAction = async event => {
      const data = JSON.stringify({
        text: 'Hello, Utkarsh',
        type: 'text',
        phone_number_id: '108603772099729',
        from: '15550227728'
      })
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:3002/webhook',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + AuthToken
        },
        data
      }

      //console.log('config for nodeJS API: ', config)

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
    return myAction(event)
  }

  // send messages from Botpress to Rocket.Chat
  async handleOutgoingEvent(event: sdk.IO.Event, next: sdk.IO.MiddlewareNextCallback) {
    // sending text
    //console.log('event.type: ', event.type)

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
    //console.log('event.channel: ', event.channel)
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
