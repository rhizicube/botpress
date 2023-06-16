// import { messages } from '../typings'
// import * as log_1 from './log'
import * as sdk from 'botpress/sdk'
import { EventEmitter } from 'events'
// import { IAsteroid } from 'node_modules/@rocket.chat/sdk/dist/config/asteroidInterfaces'
import * as settings from './settings'

const axios = require('axios')
const bodyParser = require('body-parser')
const express = require('express')
const app = express()

const _messageCollectionName = 'stream-room-messages'
const _messageStreamName = '__my_messages__'

//Event Emitter for listening to connection.
export declare const events: EventEmitter

/**
 * Proxy for `reactToMessages` with some filtering of messages based on config.
 *
 * @param callback Function called after filters run on subscription events.
 *  - Uses error-first callback pattern
 *  - Second argument is the changed item
 *  - Third argument is additional attributes, such as `roomType`
 * @param options Sets filters for different event/message types.
 */


/**
 * Array of messages received from reactive collection
 */
export declare let messages: ICollection

/**
 * Connection options type
 * @param host        Rocket.Chat instance Host URL:PORT (without protocol)
 * @param timeout     How long to wait (ms) before abandoning connection
 */
export interface IConnectOptions {
  host?: string
  useSsl?: boolean
  timeout?: number
  integration?: string
}
/**
 * Message respond options
 * @param rooms       Respond to only selected room/s (names or IDs)
 * @param allPublic   Respond on all public channels (ignores rooms if true)
 * @param dm          Respond to messages in DM / private chats
 * @param livechat    Respond to messages in livechat
 * @param edited      Respond to edited messages
 */
export interface IRespondOptions {
  rooms?: string[]
  allPublic?: boolean
  dm?: boolean
  livechat?: boolean
  edited?: boolean
}
/**
 * Loggers need to provide the same set of methods
 */


/**
 * An Asteroid instance for interacting with Rocket.Chat.
 * Variable not initialised until `connect` called.
 */

export interface IAsteroidDDP extends EventEmitter {
  readyState?: 1 | 0
}

export interface IUserOptions {
  username?: string
  email?: string
  password: string
}

export interface ISubscription {
  stop: () => void
  ready: Promise<IReady>
  id?: string
}
export interface IReady {
  state: string
  value: string
}

export interface IMethodResult {
  result: Promise<any>
  updated: Promise<any>
}
export interface IAsteroid extends EventEmitter {
  connect?: () => Promise<void>
  disconnect?: () => Promise<void>
  createUser?: (usernameOrEmail: string, password: string, profile: IUserOptions) => Promise<any>
  loginWithLDAP?: (...params: any[]) => Promise<any>
  loginWithFacebook?: (...params: any[]) => Promise<any>
  loginWithGoogle?: (...params: any[]) => Promise<any>
  loginWithTwitter?: (...params: any[]) => Promise<any>
  loginWithGithub?: (...params: any[]) => Promise<any>
  loginWithPassword?: (usernameOrEmail: string, password: string) => Promise<any>
  logout?: () => Promise<null>
  subscribe?: (name: string, ...params: any[]) => ISubscription
  subscriptions?: ISubscription[]
  call?: (method: string, ...params: any[]) => IMethodResult
  apply?: (method: string, params: any[]) => IMethodResult
  getCollection?: (name: string) => ICollection
  resumeLoginPromise?: Promise<string>
  ddp?: IAsteroidDDP
}



export interface ILogger {
  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  warning: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
}
/**
 * Error-first callback param type
 */
export interface ICallback {
  (error: Error | null, ...args: any[]): void
}

/**
 *
 */
export interface ICollection {
  name: string
  insert: (item: any) => ICollectionResult
  update: (id: string, item: any) => ICollectionResult
  remove: (id: string) => ICollectionResult
  reactiveQuery: (selector: object | Function) => IReactiveQuery
}
/**
 * The `local` promise is immediately resolved with the `_id` of the updated
 * item. That is, unless an error occurred. In that case, an exception will be
 * raised.
 * The `remote` promise is resolved with the `_id` of the updated item if the
 * remote update is successful. Otherwise it's rejected with the reason of the
 * failure.
 */
export interface ICollectionResult {
  local: Promise<any>
  remote: Promise<any>
}
/**
 * A reactive subset of a collection. Possible events are:
 * `change`: emitted whenever the result of the query changes. The id of the
 * item that changed is passed to the handler.
 */
export interface IReactiveQuery {
  on: (event: string, handler: Function) => void
  result: any[]
}


export declare let asteroid: IAsteroid


export declare function RespondToMessages(callback: ICallback, options?: IRespondOptions): Promise<void | void[]>

class Subscription {
  private _name: string
  private _params: any[]
  private _fingerprint: string
  private _asteroid: IAsteroid
  // private _ready: Q.Deferred<any>
  // public ready: Q.Promise<any>
  public id: string

  constructor(name: string, params: any[], fingerprint: string, asteroid: IAsteroid) {
    this._name = name
    this._params = params
    this._fingerprint = fingerprint
    this._asteroid = asteroid
    // Subscription promises
    // this._ready = Q.defer()
    // this.ready = this._ready.promise
    // Subscribe via DDP
    const onReady = this._onReady.bind(this)
    const onStop = this._onStop.bind(this)
    const onError = this._onError.bind(this)
    // this.id = asteroid.ddp.sub(name, params, onReady, onStop, onError)
  }

  private _onReady(): void {
    // this._ready.resolve();
  }

  private _onStop(): void {
    // Handle subscription stop
  }

  private _onError(error: any): void {
    // Handle subscription error
  }
}


// asteroid.subscribe = function (name: string, ...params: any[]): ISubscription {
//   // Assert arguments type

//   // asteroid.utils.must.beString(name)

//   // Collect arguments into array
//   const args = Array.prototype.slice.call(arguments)
//   // Hash the arguments to get a key for _subscriptionsCache
//   const fingerprint = JSON.stringify(args)
//   // Only subscribe if there is no cached subscription
//   if (!this._subscriptionsCache[fingerprint]) {
//     // Get the parameters of the subscription
//     const params = args.slice(1)
//     // Subscribe
//     const sub = new Subscription(
//       name,
//       params,
//       fingerprint,
//       this
//     )
//     // this._subscriptionsCache[sub._fingerprint] = sub
//     this.subscriptions[sub.id] = sub
//   }
//   return this._subscriptionsCache[fingerprint]
// }

// asteroid.loginWithPassword = function (usernameOrEmail: string, password: string) {
//   const self = this
//   const loginParameters = {
//     password,
//     user: {
//       username: 'utkarsh-wa',
//       email: 'abhinav@rhiziube.ai'
//     }
//   }
//   return self.login(loginParameters)
// }

function login(credentials: { username: string; password: string; ldap?: boolean; email?: string; ldapOptions?: any } = {
  username: settings.username,
  password: settings.password,
  ldap: settings.ldap
}): Promise<string> {
  let login: Promise<string>

  console.log(`[login] Logging in ${credentials.username}`)

  asteroid.loginWithPassword = function (usernameOrEmail: string, password: string) {
    const self = this
    const loginParameters = {
      password,
      user: {
        username: 'utkarsh-wa',
        email: 'abhinav@rhiziube.ai'
      }
    }
    return self.login(loginParameters)
  }



  login = asteroid.loginWithPassword(credentials.email || credentials.username, credentials.password)
  // }

  return login
    .then((loggedInUserId: string) => {
      exports.userId = loggedInUserId
      return loggedInUserId
    })
    .catch((err: Error) => {
      console.log('[login] Error:', err)
      throw err// throw after log to stop async chain
    })
}


function subscribe(topic: string, roomId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log(`[subscribe] Preparing subscription: ${topic}: ${roomId}`)

    asteroid.subscribe = function (name: string, ...params: any[]): ISubscription {
      // Assert arguments type

      // asteroid.utils.must.beString(name)

      // Collect arguments into array
      const args = Array.prototype.slice.call(arguments)
      // Hash the arguments to get a key for _subscriptionsCache
      const fingerprint = JSON.stringify(args)
      // Only subscribe if there is no cached subscription
      if (!this._subscriptionsCache[fingerprint]) {
        // Get the parameters of the subscription
        const params = args.slice(1)
        // Subscribe
        const sub = new Subscription(
          name,
          params,
          fingerprint,
          this
        )
        // this._subscriptionsCache[sub._fingerprint] = sub
        this.subscriptions[sub.id] = sub
      }
      return this._subscriptionsCache[fingerprint]
    }

    const subscription = asteroid.subscribe(topic, roomId, true)
    exports.subscriptions.push(subscription)
    return subscription.ready
      .then((id: any) => {
        console.log(`[subscribe] Stream ready: ${id}`)
        resolve(subscription)
      })
      .catch((err: any) => {
        console.log(err)
        reject(err)
      })
  })
}






function subscribeToMessages(): Promise<any> {
  return subscribe(_messageCollectionName, _messageStreamName)
    .then((subscription: any) => {
      const messages = asteroid.getCollection(_messageCollectionName)
      return messages
    })
}


class ReactiveQuery {
  private _set: any
  public result: any[]

  constructor(set: any) {
    this.result = []
    this._set = set
    this._getResult()

    this._set.on('put', (id: any) => {
      this._getResult()
      this._emit('change', id)
    })

    this._set.on('del', (id: any) => {
      this._getResult()
      this._emit('change', id)
    })
  }

  private _getResult() {
    // Implement the logic to update the `result` array based on the `set` data.
  }

  private _emit(event: string, id: any) {
    // Implement the logic to emit the specified event with the provided id.
  }
}




// const self = this
// const router = self.bp.http.createRouterForBot('channel-rocketchat', {
//   checkAuthentication: false,
//   enableJsonBodyParser: true
// })
// let count = 0
// app.post('/users', async (req, res) => {
//   ++count
//   // await self.sendMessageToRocketChat(eventTrigger)
//   res.status(201).json({ 'number': count })


//   const changedMessageQuery = { count }

//   if (changedMessageQuery) {
//     const changedMessage = changedMessageQuery

//     if (Array.isArray(changedMessage)) {
//       console.log(`[received] Message in room ${changedMessage}`)
//       callback(null, changedMessage, changedMessage)
//     } else {
//       console.log('[received] Update without message args')
//     }
//   } else {
//     console.log('[received] Reactive query at ID  without results')
//   }
// })
// }
// )


// exports.reactToMessages = reactToMessages

export async function respondToMessages(
  callback: (error: Error | null, message: any, meta: any) => void,
  options: any = {}
): Promise<void> {
  console.log('calling.... calling..respond..please..', callback)
  const config = { ...settings, options } // Use the imported settings or define them accordingly

  const promise: Promise<void | void[]> = Promise.resolve()
  let lastReadTime = new Date() // init before any message read

  await reactToMessages(async (err: Error | null, message: any, meta: any) => {
    if (err) {
      console.log(`[received] Unable to receive: ${err.message}`)
      callback(err, '', null) // bubble errors back to adapter
    }

    if (message.u._id === (await login())) {
      return
    }

    const isDM = meta.roomType === 'd'
    if (isDM && !config.dm) {
      return
    }

    const isLC = meta.roomType === 'l'
    if (isLC && !config.livechat) {
      return
    }

    if (!config.allPublic && !isDM && !meta.roomParticipant) {
      return
    }

    let currentReadTime = new Date(message.ts.$date)

    if (!config.edited && message.editedAt) {
      return
    }

    if (message.editedAt) {
      currentReadTime = new Date(message.editedAt.$date)
    }

    if (currentReadTime <= lastReadTime) {
      return
    }

    console.log(`[received] Message ${message._id} from ${message.u.username}`)

    lastReadTime = currentReadTime

    callback(null, message, meta)
  })

  return promise.then(() => console.log('returned value.......'))
}

async function reactToMessages(callback: (err: Error | null, message: any, meta: any) => any): Promise<any> {
  const messages = await (subscribeToMessages())
  messages.reactiveQuery({}).on('change', (_id: string) => {
    const changedMessageQuery = messages.reactiveQuery({ _id })
    if (changedMessageQuery.result && changedMessageQuery.result.length > 0) {
      const changedMessage = changedMessageQuery.result[0]

      if (Array.isArray(changedMessage.args)) {
        console.log(`[received] Message in room ${changedMessage.args[0].rid}`)
        callback(null, changedMessage.args[0], changedMessage.args[1])
      } else {
        console.log('[received] Update without message args')
      }
    } else {
      console.log(`[received] Reactive query at ID ${_id} without results`)
    }
  })
}
