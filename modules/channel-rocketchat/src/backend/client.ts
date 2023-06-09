import { driver, methodCache, api } from '@rocket.chat/sdk'
//import Promise from "bluebird";

import * as sdk from 'botpress/sdk'
import { asyncMiddleware, asyncMiddleware as asyncMw, BPRequest } from 'common/http'
import { Request, Response, NextFunction } from 'express'
import _ from 'lodash'

import { Config } from '../config'
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
  async listen() {
    const self = this

    // Rocket.Chat receive function
    // const receiveRocketChatMessages = async function(err, message, meta, bp: typeof sdk) {
    // eslint-disable-next-line no-console
    console.log('entering in try block')
    // try {
    console.log('calling listen api')

    const router = self.bp.http.createRouterForBot('channel-rocketchat', {
      checkAuthentication: false,
      enableJsonBodyParser: true
    })

    const asyncMiddleware = asyncMw(self.bp.logger)

    console.log('router', router)
    router.get('/', (req, res) => {
      console.log('/')
      res.status(200).send('Server has setup')
    })

    router.get('/testing', async (req, res) => {
      console.log('/listens')
      res.send({ Hello: 'Testing' })
    })

    router.post(
      '/listen',
      asyncMiddleware(async (req: Request, res: Response) => {
        // Parse the request body from the POST
        // Check the Incoming webhook message
        // console.log(JSON.stringify(req.body, null, 2))
        const datas = {
          name: 'Rhizicube',
          job: 'AI'
        }
        // const axiosConfig = await bp.http.getAxiosConfigForBot('basic-bot-01', { studioUrl: true })

        axios({
          method: 'POST', // Required, HTTP method, a string, e.g. POST, GET
          url: 'https://reqres.in/api/users',
          data: datas,
          headers: { 'Content-Type': 'application/json' }
          // eslint-disable-next-line no-console
        })
          .then(response => {
            console.log('listen api response', JSON.stringify(response.data))
            res.sendStatus(201)
          })
          .catch(error => {
            console.log('listen api error', error)
            res.sendStatus(500)
          })
        console.log('listen api response')
      })
    )


    const receiveRocketChatMessages = async function (err, message: any) {
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

        // router.post('/users', async (req, res) => {
        //   const count = 0
        // await self.sendMessageToRocketChat(eventTrigger)
        //   res.status(201).json({ 'number': count })
        // })
        const options = {
          dm: true,
          livechat: false,
          edited: true
        }
        // const message = { u_id: 'gKQNTX5zEeH4QAEfH', rid: 'GENERAL', msg: 'WORKING...................' }

        return driver.respondToMessages(receiveRocketChatMessages, options)
      }
    }


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
    console.log('event: ', event)

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
          Authorization:
            'Bearer EAARB9ujTATsBAFW4hAFwhBch1yIzZBoy2JjhuN0ShJZA7lMRYnIf0RCdlIOlEPhWuy1xN3j7ZCrGtArn663b21u9wIXZAocBt80leZCBFdDooXOwS3DgZCgoIXKZA3CP8jtVZBq51Ixm25AOlIMHp2qxZA3TZAjvmGYvBKeFUiQS2uyAI6qz5IandpbiZBSqHcSkWNdfvyZB2KrZCo24pGErTeCrSnAxHqdX2k0gZD'
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
    if (event.channel !== 'web') {
      return next()
    }

    const client: RocketChatClient = clients[event.botId]
    if (!client) {
      return next()
    }

    return client.handleOutgoingEvent(event, next)
  }
}
