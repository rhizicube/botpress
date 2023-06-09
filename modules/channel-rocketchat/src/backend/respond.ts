import { messages } from 'types/common/wa'
// import * as log_1 from './log'
import * as settings from './settings'

function reactToMessages(callback: (err: Error | null, message: any, meta: any) => void): void {
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

exports.reactToMessages = reactToMessages

export function respondToMessages(
  callback: (error: Error | null, message: any, meta: any) => void,
  options: any = {}
): Promise<void> {
  const config = { ...settings, options } // Use the imported settings or define them accordingly

  const promise: Promise<void | void[]> = Promise.resolve()
  exports.lastReadTime = new Date() // init before any message read

  reactToMessages(async (err: Error | null, message: any, meta: any) => {
    if (err) {
      console.log(`[received] Unable to receive: ${err.message}`)
      callback(err, '', null) // bubble errors back to adapter
    }

    if (message.u._id === exports.userId) {
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

    if (currentReadTime <= exports.lastReadTime) {
      return
    }

    console.log(`[received] Message ${message._id} from ${message.u.username}`)

    exports.lastReadTime = currentReadTime

    callback(null, message, meta)
  })

  return promise.then(() => undefined)
}
