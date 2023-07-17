import { driver, methodCache, api } from '@rocket.chat/sdk'
//import Promise from "bluebird";
import * as sdk from 'botpress/sdk'
// import { uuid } from 'botpress/sdk'
import { asyncMiddleware, asyncMiddleware as asyncMw, BPRequest } from 'common/http'
import { Request, Response, NextFunction } from 'express'
import _ from 'lodash'

import { Config } from '../config'
import { Clients } from './typings'
//import { respondToMessages } from './wa'
//import { respondToMessages } from './whatsapp'


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
  // public userId: uuid


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

    console.log('api response in listen: ', x)
    const userId = x.threadId

    // Returns an existing user or create a new one with the specified keys
    // export function getOrCreateUser(channel: string, userId: string, botId?: string): GetOrCreateResult<User>
    // const users = await this.bp.messaging.forBot(botId).getUser(userId)

    // const users = this.bp.messaging.forBot(botId).getUser(userId)
    // console.log('users,getusers', users)

    await self.bp.users.getOrCreateUser('channel-rocketchat', userId, botId) // Just to create the user if it doesn't exist
    const user = await self.bp.users.getOrCreateUser('channel-rocketchat', userId, botId)
    console.log('###################', 'user', user, user.result.id)

    self.bp.events.sendEvent(
      self.bp.IO.Event({
        //id: message.ts.$date.toString(),
        botId,
        channel: 'channel-rocketchat',
        direction: 'incoming',
        payload: { text: x.message, user_info: user },
        type: 'text',
        threadId: x.threadId,
        // preview: message.msg,
        target: 'GENERAL'
      })
    )

    // const event = bp.IO.Event({
    //   messageId: message.id,
    //   botId: req.botId,
    //   channel: 'web',
    //   direction: 'incoming',
    //   payload,
    //   target: req.userId,
    //   threadId: req.conversationId,
    //   type: payload.type,
    //   credentials: req.credentials
    // })



    // Rocket.Chat receive function
    // const receiveRocketChatMessages = async function (err, message, meta) {
    //   // eslint-disable-next-line no-console
    //   console.log('entering in try block')
    //   try {
    //     //console.log('calling listen api')
    //     if (!err) {
    //       // If message have .t so it's a system message, so ignore it
    //       if (message.t === undefined) {
    //         const userId = message.u._id
    //         const user = await self.bp.users.getOrCreateUser(message.rid, userId)

    //         debugIncoming('Receiving message %o', message)
    //         debugIncoming('User %o', user)
    //         // console.log('inside receiveRocketChatMessages')
    //         await self.bp.events.sendEvent(
    //           self.bp.IO.Event({
    //             //id: message.ts.$date.toString(),
    //             botId: self.botId,
    //             channel: 'rocketchat',
    //             direction: 'incoming',
    //             payload: { text: message.msg, user_info: user },
    //             type: 'text',
    //             preview: message.msg,
    //             target: message.rid
    //           })
    //         )
    //       }
    //     }
    //   } catch (error) {
    //     console.log(error)
    //   }
    // }

    // // //console.log('calling callback function')
    // const options = {
    //   dm: true,
    //   livechat: true,
    //   edited: true
    // }
    // // console.log('Listening to Rocket.Chat messages ... ')
    // return driver.respondToMessages(receiveRocketChatMessages, options)

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
    const AuthToken = ''
    const user_phone_number = ''
    const phone_number_id = ''
    const current_version = ''
    const url = `https://graph.facebook.com/${current_version}/${phone_number_id}/messages`

    console.log('event: ', event)
    // const session = await this.db.getOrCreateUserSession(event);
    // const session = {
    //   botId: event.botId,
    //   channel: event.channel,
    //   userId: event.target,
    //   thread_id: event.threadId
    // }


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

      // console.log('config for nodeJS API: ', config)

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

    // const confige = await this.bp.http.getAxiosConfigForBot(event.botId, { localUrl: true })
    // console.log('$$$$$$$$$$$$$$$$$', configs)
    // console.log('filtered confige', JSON.stringify(confige, null, 2))
    // const res = await axios.get('/mod/hitlnext/agents', confige)
    // console.log('hitl agent', JSON.stringify(res.data, null, 2))
    // console.log('online agent', res.data.some(x => x.online))

    // event.state.onlineAgents = res.data.some(x => x.online)
    // console.log('##event state##', event.state.temp.onlineAgents)
    return myAction(event)
    // const msg =  event.payload?.text?.image
    // this.bp.notifications.create(event.botId, {msg, level: 'info', url: '/modules/hitl' })
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

    const messaging = bp.messaging.forBot(event.botId)
    console.log('messaging...', messaging)

    const messageType = event.type === 'default' ? 'text' : event.type
    console.log('messagingType...', messageType)

    const userId = event.target
    console.log('userId...', userId)

    const conversationId = event.threadId


    // if (conversationId === undefined) {
    //   const convs = await messaging.listConversations(userId, 1)
    //   console.log('firstconverstionId...', conversationId)
    //   if (convs?.length) {
    //     conversationId = convs[0].id
    //     console.log('converstionId...', conversationId)
    //   } else {
    //     conversationId = (await messaging.createConversation(userId)).id
    //     console.log('converstionId...', conversationId)
    //   }
    // }


    const client: RocketChatClient = clients[event.botId]
    if (!client) {
      return next()
    }

    return client.handleOutgoingEvent(event, next)
  }
}
