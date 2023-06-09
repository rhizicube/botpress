/// <reference path="./waInterfaces.d.ts" />

import { EventEmitter } from 'events'
import { IRespondOptions, ICallback, ICollection } from './waInterfaces'

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
export declare function respondToMessages(callback: ICallback, options?: IRespondOptions): Promise<void | void[]>

/**
 * Array of messages received from reactive collection
 */
export declare let messages: ICollection