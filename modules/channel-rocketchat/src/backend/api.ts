import axios from 'axios'
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
  const api = () => {
    return new Promise((resolve, reject) => {
      const datas = {
        name: 'Rhizicube',
        job: 'AI Services & Development'
      }
      axios({
        method: 'POST',
        url: 'https://reqres.in/api/users',
        data: datas,
        headers: { 'Content-Type': 'application/json' }
      })
        .then(response => {
          console.log('API response:', response.data)
          resolve(response.data)
        })
        .catch(error => {
          console.log('API error:', error)
          reject(error)
        })
    })
  }
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
        const apiResponse = await api()
        console.log('API response:', apiResponse)
        res.sendStatus(201)
        void listenCallback(apiResponse)
      } catch (error) {
        console.log('API error:', error)
        res.sendStatus(500)
      }
    })
  )
}
