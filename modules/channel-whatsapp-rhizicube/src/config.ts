export interface Config {
  /**
   * If the channel is enabled for the bot (this config file must be in the data/bots/BOT_ID/config folder)
   * @default false
   */
  enabled: boolean
  /**
   * This is the value of Rhizicube.Chat Bot User
   * @default
   */
  rocketChatBotUser: string
  /**
   * The value of Rhizicube.Chat Bot User Passord
   * @default signin_secret
   */
  rocketChatBotPassword: string

  /**
   * RocketChat URL ex. http://localhost:3000
   */
  rocketChatUrl: string

  /**
   * RocketChat URL ex. http://localhost:3000
   */
  rocketChatUseSSL: boolean

  /**
   * Rhizicube.Chat room.
   * @default GENERAL
   */
  rocketChatRoom: string

  /**
   * Rhizicube.Chat scope ex. "admin,bot,chat:write:bot,commands,identify,incoming-webhook,channels:read"
   * @default
   */
  scope: string
}
