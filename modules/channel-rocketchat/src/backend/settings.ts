// Login settings - LDAP needs to be explicitly enabled
export const username: string = process.env.ROCKETCHAT_USER || 'bot'
export const password: string = process.env.ROCKETCHAT_PASSWORD || 'pass'
export const ldap: boolean = (process.env.ROCKETCHAT_AUTH === 'ldap')

// Connection settings - Enable SSL by default if Rocket.Chat URL contains https
export const host: string = process.env.ROCKETCHAT_URL || 'localhost:3000'
export const useSsl: boolean = (process.env.ROCKETCHAT_USE_SSL)
  ? ((process.env.ROCKETCHAT_USE_SSL || '').toString().toLowerCase() === 'true')
  : ((process.env.ROCKETCHAT_URL || '').toString().toLowerCase().startsWith('https'))
export const timeout: number = 20 * 1000 // 20 seconds

// Respond settings - reactive callback filters for .respondToMessages
export const rooms: string[] = (process.env.ROCKETCHAT_ROOM)
  ? (process.env.ROCKETCHAT_ROOM || '').split(',').map((room) => room.trim())
  : []
export const allPublic: boolean = (process.env.LISTEN_ON_ALL_PUBLIC || 'false').toLowerCase() === 'true'
export const dm: boolean = (process.env.RESPOND_TO_DM || 'false').toLowerCase() === 'true'
export const livechat: boolean = (process.env.RESPOND_TO_LIVECHAT || 'false').toLowerCase() === 'true'
export const edited: boolean = (process.env.RESPOND_TO_EDITED || 'false').toLowerCase() === 'true'

// Message attribute settings
export const integrationId: string = process.env.INTEGRATION_ID || 'js.SDK'

// Cache settings
export const roomCacheMaxSize: number = parseInt(process.env.ROOM_CACHE_SIZE || '10', 10)
export const roomCacheMaxAge: number = 1000 * parseInt(process.env.ROOM_CACHE_MAX_AGE || '300', 10)
export const dmCacheMaxSize: number = parseInt(process.env.DM_ROOM_CACHE_SIZE || '10', 10)
export const dmCacheMaxAge: number = 1000 * parseInt(process.env.DM_ROOM_CACHE_MAX_AGE || '100', 10)
