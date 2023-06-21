import { driver, methodCache, api } from '@rocket.chat/sdk'
//import Promise from "bluebird";

import * as sdk from 'botpress/sdk'
import { asyncMiddleware, asyncMiddleware as asyncMw, BPRequest } from 'common/http'
import { Request, Response, NextFunction } from 'express'
import _ from 'lodash'
import { Config } from '../config'
import { respondToMessages } from './respond'
import { Clients } from './typings'

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
      console.log('Connected to Rocket.Chat at ' + this.config.rocketChatUrl)
      // login as Rocket.Chat bot user
      this.user = await driver.login({
        username: this.config.rocketChatBotUser,
        password: this.config.rocketChatBotPassword
      })
      console.log('Logged in Rocket.Chat as ' + this.config.rocketChatBotUser)
      // join to Rocket.Chat rooms
      this.roomList = handleChannel(this.config.rocketChatRoom)
      this.roomsJoined = await driver.joinRooms(this.roomList)
      console.log('BOT User ' + this.config.rocketChatBotUser + ' joined rooms ' + this.config.rocketChatRoom)
      // subscribe to messages
      this.subscribed = await driver.subscribeToMessages()
      console.log('subscribed to Rocket.Chat messages')
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
  async listen(x) {
    const self = this

    console.log('api response in listen: ', x)

    // Returns an existing user or create a new one with the specified keys
    // export function getOrCreateUser(channel: string, userId: string, botId?: string): GetOrCreateResult<User>

    const userId = 'GENERAL'
    const user = self.bp.users.getOrCreateUser('GENERAL', userId, this.botId)

    self.bp.events.sendEvent(
      self.bp.IO.Event({
        // id: message.ts.$date.toString(),
        // messageId: 'rhizicube',
        botId: this.botId,
        channel: 'channel-rocketchat',
        direction: 'incoming',
        payload: { text: x.name, user_info: user },
        type: 'text',
        // preview: x.name,
        target: 'GENERAL',

      })
    )


    // Rocket.Chat receive function
    // eslint-disable-next-line no-console
    console.log('entering in try block')
    // try {
    const receiveRocketChatMessages = async function (err, message, bp: typeof sdk) {
      console.log('%%%%%%%%%%%%%%%%msg%%%%%%%%%%%%%%%%%%%', message)
      if (!err) {
        const userId = message.u_id
        const user = self.bp.users.getOrCreateUser('GENERAL', userId)
        debugIncoming('Receiving message %o', message)
        debugIncoming('User %o', user)

        // Random API CALL:-
        // const apiResponse = await axios.get('https://reqres.in/api/users/2')
        console.log('API  CUSTOM CALL..')

        self.bp.events.sendEvent(
          self.bp.IO.Event({
            //id: message.ts.$date.toString(),
            botId: 'basic-bot-01',
            channel: 'channel-rocketchat',
            direction: 'incoming',
            payload: { text: message.msg, user_info: user },
            type: 'text',
            // preview: message.msg,
            target: message.rid
          })
        )
      }
    }

    const options = {
      dm: true,
      livechat: false,
      edited: true
    }

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


    // debugOutgoing('Sending event %o', event)
    // console.log('Sending event %o', event)

    // const msg = event.payload.text
    // const channelId = event.threadId || event.target
    // const messageType = event.type === 'default' ? 'text' : event.type

    // return driver.sendToRoom(msg, channelId)

    console.log('event: ', event)

    const myAction = async event => {
      const data = JSON.stringify({
        text: event.payload.text,
        type: 'text',
        phone_number_id: '114392358180996',
        from: '15550449433'
      })
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://localhost:3002/webhook',
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer EAAMqZC1mdllcBAJIGI5ZCZCW9FS4nQt2hmZCZCPSKOt1y8EIhx3kvY5ZBZC7ZBL4V9xZAP2CCvzTOJ4iH2ZBeAuiFzYfz0TJQf63NqvUjitqLkfkpYwfeZAYOOtm8zCsXZBf7fzIvvHt6rufM1SzPZBy1zSIYOMXMIcezEmQ4keCs1ZANTewpYgYbvR9S50imvkeoIIUxDKzSzElZBU1fZCFKW89eZBDce4Nk8CSy1F8ZD'
        },
        data
      }

      console.log('config for nodeJS API: ', config)

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
    console.log('event.type: ', event.type)

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
    console.log('event.channel: ', event.channel)

    // console.log('conversationId....', event.threadId)
    // console.log('userId...', event.target)
    // console.log('messaging....', bp.messaging.forBot(event.botId))

    // const userId = event.target
    // const messaging = bp.messaging.forBot(event.botId)
    // let conversationId = event.threadId
    // const cId = ( ( messaging.createConversation(event.target))).then(data => console.log(data))


    // const conversationId = bp.messaging.createConversation(event.target)


    // console.log('conversationId....', conversationId)


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
