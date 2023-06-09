/// <reference path="./wa.d.ts" />

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