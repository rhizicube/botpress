import * as sdk from 'botpress/sdk'
import { Config } from '../config'
import api from './api'
import { setupMiddleware, RocketChatClient } from './client'
import { Clients } from './typings'
let router
const clients: Clients = {}

const botID = []

let apiResponse: any
const isBotConnected = false

// This is called when server is started, usually to set up the database
const onServerStarted = async (bp: typeof sdk) => {
  // from lack module

  await setupMiddleware(bp, clients)
}

const onServerReady = async (bp: typeof sdk) => {
  console.log('onserverReady')
  // create a router to the bot
  router = bp.http.createRouterForBot('channel-rocketchat', {
    checkAuthentication: false,
    enableJsonBodyParser: false,
    enableUrlEncoderBodyParser: false
  })
  bp.logger.info('calling api')
  try {
    // Call the API and store the response in the variable
    const listenCallback = async (x: any) => {
      // Call the listen function here
      apiResponse = x
      console.log('apiResponse: ', apiResponse)
      const Bots = await bp.bots.getAllBots()
      console.log('bots:', Bots)
      for (const botId of Bots.keys()) {
        botID.push(botId)
      }
      console.log('botIds:', botID)
      botID.forEach(async botId => {
        const config = (await bp.config.getModuleConfigForBot('channel-rocketchat', botId, true)) as Config
        console.log('config', botId)
        if (config.enabled) {
          const bot = clients[botId]
          if (bot) {
            await bot.listen(apiResponse)
          }
        }
      })
    }
    void api(bp, listenCallback)
  } catch (error) {
    console.error('Error calling API:', error)
  }
}

// Every time a bot is created (or enabled), this method will be called with the bot id
const onBotMount = async (bp: typeof sdk, botId: string) => {
  console.log('onBotMount')
  //  botId = 'basic-bot-01'
  const config = (await bp.config.getModuleConfigForBot('channel-rocketchat', botId, true)) as Config
  console.log('config')
  // if channel is enabled in bot config create Rocket.Chat client
  if (config.enabled) {
    const bot = new RocketChatClient(bp, botId, config, router)
    await bot.connect()
    clients[botId] = bot
  }
}

// This is called every time a bot is deleted (or disabled)
const onBotUnmount = async (bp: typeof sdk, botId: string) => {
  console.log('onBotUnmount')
  const client = clients[botId]
  if (!client) {
    return
  }

  await client.disconnect()
  delete clients[botId]
}

const entryPoint: sdk.ModuleEntryPoint = {
  onServerStarted,
  onServerReady,
  onBotMount,
  onBotUnmount,
  definition: {
    // This must match the name of your module's folder, and the name in package.json
    name: 'channel-rocketchat',
    /**
     * When menuIcon is set to `custom`, you need to provide an icon. It must be at that location: `/assets/icon.png`
     * Otherwise, use Material icons name: https://material.io/tools/icons/?style=baseline
     */
    menuIcon: 'flag',
    // This is the name of your module which will be displayed in the sidebar
    menuText: 'Rocket.Chat Module',
    // When set to `true`, the name and icon of your module won't be displayed in the sidebar
    noInterface: true,
    // The full name is used in other places, for example when displaying bot templates
    fullName: 'Rocket.Chat Module',
    // Not used anywhere, but should be a link to your website or module repository
    homepage: 'https://www.met.it'
  }
}

export default entryPoint
