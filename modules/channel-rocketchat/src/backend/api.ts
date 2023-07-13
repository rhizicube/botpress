import axios from 'axios'
import bodyParser from 'body-parser'
import * as sdk from 'botpress/sdk'
import { asyncMiddleware as asyncMw, StandardError } from 'common/http'
import { Request, Response } from 'express'



type ListenCallback = (apiResponse: any) => Promise<void>
export default async (bp: typeof sdk, listenCallback: ListenCallback) => {
  const asyncMiddleware = asyncMw(bp.logger)
  const router = bp.http.createRouterForBot('channel-rocketchat', {
    checkAuthentication: false,
    enableJsonBodyParser: true
  })
  bp.logger.info('router:', router)
  router.use(bodyParser.json())
  const api = async (respThreadId) => {
    // return new Promise((resolve, reject) => {
    const datas = {
      name: 'Rhizicube',
      job: 'AI',

    }
    // console.log('################3', req)

    try {
      const response = await axios({
        method: 'POST',
        url: 'https://reqres.in/api/users',
        data: datas,
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('API response:', response.data)
      const apiResponse = { ...response.data, threadId: respThreadId }

      return apiResponse
    } catch (error) {
      console.log('API error:', error)
      throw error
    }

  }
  // )

  router.get('/', (req, res) => {
    console.log('/')
    res.status(200).send('Server has setup')
  })

  router.get('/testing', async (req, res) => {
    console.log('/testing')
    res.send({ Hello: 'Testing' })
  })

  router.post(
    '/listen',
    asyncMiddleware(async (req: Request, res: Response) => {
      try {
        console.log('%%%%%%%%%%%%%%%%%%%%%%%%', 'req.body', req.body)
        const apiResponse = await api(req.body.threadId) // Call the API and wait for the response
        //console.log('API response:', apiResponse)
        // const resultObject = {
        //   apiResponse,
        //   threadId: req.body.threadId
        // }
        // console.log('#######', resultObject)
        void listenCallback(apiResponse)
        res.sendStatus(201)

      } catch (error) {
        console.log('API error:', error)
        res.sendStatus(500)
      }
    })
  )
}
