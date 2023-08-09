/* eslint-disable no-console */
import * as sdk from 'botpress/sdk'
import { Config } from '../config'
import api from './api'
import { setupMiddleware, RocketChatClient } from './client'
import { Clients } from './typings'

let router
let apiResponse: any
const clients: Clients = {}

// This is called when server is started, usually to set up the database
const onServerStarted = async (bp: typeof sdk) => {
  await setupMiddleware(bp, clients)
}

// At this point, you would likely setup the API route of your module.
const onServerReady = async (bp: typeof sdk) => {
  // create a router to the bot
  router = bp.http.createRouterForBot('channel-whatsapp-rhizicube', {
    checkAuthentication: false,
    enableJsonBodyParser: false,
    enableUrlEncoderBodyParser: false
  })
  bp.logger.info('calling api')
}

// Every time a bot is created (or enabled), this method will be called with the bot id
const onBotMount = async (bp: typeof sdk, botId: string) => {
  console.log('onBotMount')
  const router = bp.http.createRouterForBot('channel-whatsapp-rhizicube', {
    checkAuthentication: false,
    enableJsonBodyParser: false,
    enableUrlEncoderBodyParser: false
  })

  const config = (await bp.config.getModuleConfigForBot('channel-whatsapp-rhizicube', botId, true)) as Config
  const bot = new RocketChatClient(bp, botId, config, router)
  const listenCallback = async (x: any) => {
    apiResponse = x
    const Bots = await bp.bots.getAllBots()
    await bot.listen(x, botId)
    return apiResponse
  }
  void (await api(bp, listenCallback))
}

// This is called every time a bot is deleted (or disabled)
const onBotUnmount = async (bp: typeof sdk, botId: string) => {
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
    name: 'channel-whatsapp-rhizicube',
    /**
     * When menuIcon is set to `custom`, you need to provide an icon. It must be at that location: `/assets/icon.png`
     * Otherwise, use Material icons name: https://material.io/tools/icons/?style=baseline
     */
    menuIcon: 'flag',
    // This is the name of your module which will be displayed in the sidebar
    menuText: 'Rhizicube.Chat Module',
    // When set to `true`, the name and icon of your module won't be displayed in the sidebar
    noInterface: true,
    // The full name is used in other places, for example when displaying bot templates
    fullName: 'Rhizicube Module',
    // Not used anywhere, but should be a link to your website or module repository
    homepage: 'https://www.met.it'
  }
}

export default entryPoint
