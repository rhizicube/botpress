import axios from 'axios'
import * as sdk from 'botpress/sdk'
import { asyncMiddleware as asyncMw, StandardError } from 'common/http'
import { Request, Response } from 'express'
import Database from './db'
export default async (bp: typeof sdk, db: Database) => {
  //bp.logger.info('db', db)
  /**
   * This is an example route to get you started.
   * Your API will be available at `http://localhost:3000/api/v1/bots/BOT_NAME/mod/complete-module`
   * Just replace BOT_NAME by your bot ID
   */
  const asyncMiddleware = asyncMw(bp.logger)
  const router = bp.http.createRouterForBot('complete-module')
  bp.logger.info('router :', router)
  //let event: sdk
  const flag = async () => {
    // bp.logger.info('Router', router)

    const data = {
      botId: 'greet-bot',
      reason: 'auto-hook'
    }
    bp.logger.info('data', data)
    const axiosConfig = await bp.http.getAxiosConfigForBot('greet-bot', { localUrl: true })
    //const axiosConfig = await bp.http.getAxiosConfigForBot('greet-bot', { localUrl: true })
    bp.logger.info('axios config', axiosConfig)
    // await axios.post('/count', data, axiosConfig)
  }

  void flag()

  // const data = axios.post(`/access-token`, { text }, await axiosConfig)
  // bp.logger.info('dataApi', data)
  // const data = async () => {
  //   await axios.post(`/mod/nlu/extract`, { text }, await axiosConfig)
  //   bp.logger.info('dataApi', data)
  // }

  // const extractNluContent = async () => {
  //   bp.logger.info('extractNluContent')
  //   const axiosConfig = await bp.http.getAxiosConfigForBot('greet-bot', { localUrl: true })
  //   bp.logger.info('axios config', axiosConfig)
  //   // const text = event.payload.text
  //   const text = "Testing"
  //   bp.logger.info('text', text)
  //   const data = await axios.post(`/mod/nlu/extract`, { text }, axiosConfig)
  //   bp.logger.info('dataApi', data)
  // }

  router.get(
    '/count/:id',
    asyncMiddleware(async (req: Request, res: Response) => {
      bp.logger.info('count botID')
      const { id } = req.params

      bp.logger.info('count botID', req)

      try {
        const { completeModule } = await db
          .knex('my_module_table')
          .count('id as completeModule')
          .where({ id })
          .first()

        bp.logger.info('completeModule :', { completeModule })

        res.status(201).send({ completeModule })
      } catch (err) {
        throw new StandardError('Error listing events', err)
      }
    })
  )

  // router.get('/count/:id', async (req, res) => {
  //   bp.logger.info('count botID')
  //   const id = req.params.id

  //   bp.logger.info('count botID', id)

  //   const { completeModule } = await db
  //     .knex('my_module_table')
  //     .count('id as completeModule')
  //     .where({ id })
  //     .first()

  //   bp.logger.info("completeModule :", { completeModule })

  //   res.status(201).send({ completeModule })
  // })

  router.get('/count/getRawMessages', async (req, res) => {
    bp.logger.info('count botID')
    // const id = req.params.id

    // bp.logger.info('count botID', id)

    const { completeModule } = await db
      .knex('my_module_table')
      .count('raw_message as completeModule')
      // .where({ id })
      .first()

    bp.logger.info('completeModule :', { completeModule })

    res.status(200).send({ completeModule })
  })
  // Link to access this route: http://localhost:3000/api/v1/bots/BOT_NAME/mod/complete-module/my-first-route
  // router.get('/my-first-route', async (req, res) => {
  //   // Since the bot ID is required to access your module,
  //   const botId = req.params.botId

  //   /**
  //    * This is how you would get your module configuration for a specific bot.
  //    * If there is no configuration for the bot, global config will be used. Check `config.ts` to set your configurations
  //    */
  //   const config = await bp.config.getModuleConfigForBot('complete-module', botId)

  //   res.sendStatus(200)
  // })

  // extractNluContent()
}
