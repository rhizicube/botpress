import { MessagingClient } from '@botpress/messaging-client'
import axios from 'axios'
import * as sdk from 'botpress/sdk'
import express, { Application } from 'express'
//import express from 'express'
//import { EventEmitter } from 'node:events'
import { v4 as uuidv4 } from 'uuid'
import config from '../config.json'

const app: Application = express()
app.use(express.json())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// class MyEmitter extends EventEmitter {}
// const myEmitter = new MyEmitter()
export default async (bp: typeof sdk) => {
  console.log('in discord', { ...config.messaging })
  const config1 = await bp.config.getModuleConfigForBot('rhizicube-ai', 'Stock bot', true)

  console.log(config1)
  console.log('config1.enabled', config1.enabled)
  if (config1.enabled) {
    console.log('Inside config1')
    const messaging = new MessagingClient({ ...config.messaging })
    console.log(messaging)
    messaging.setup(app, '/callback')
    const myuuid = uuidv4()
    const clientid = {
      id: myuuid
    }
    // const configs = {
    //   channels: 'rhizicube-ai',
    //   url: 'http://localhost:3101',
    //   token:
    //     '3ea98c72-2d34-4c4e-8e3a-3d9190101acb.NlnKi10MLrGJd7J79zmorwKSfle3BPtM8+xu1Iy0EYIHTFTnDvOjoyBmQODnOOY/Uw1oh+oTX+9GXNXLVsz4p7DX'
    // }
    //messaging.createUserToken(myuuid).then(res => console.log("res :",res))
    // console.log('client id :', myuuid)

   /* axios
      .post('http://localhost:3101/api/v1/admin/clients', clientid)
      .then(res => console.log(res.data))
      .catch(err => console.error(err)) */
    //generateToken.then()
    //axios.post('http://localhost:3101/api/v1/sync', '8a276c72-2318-4e8b-b91f-5d625b72e572', configs ).then((res) => console.log(res.data))
    // await axios.post('http://localhost:3002/rhizicube/test', clientid).then(res => {
    //   console.log('res.data :', res.data)
    //   if (res.data !== null) {
    messaging.on('message', async ({message }) => {
      console.log('msg', message)
      if (message.authorId) {
        // we ingore user messages
        console.log('authorId')
        return
      }

      // we get back our endpoint using the conversation id
      const [endpoint] = await messaging.listEndpoints(message.conversationId)

      // send message to that endpoint
      // const channel = discord.channels.cache.get(endpoint.thread) as TextChannel

      if (message.payload.type === 'text') {
        //   await channel.send({ content: message.payload.title, files: [message.payload.image] })
        await axios.post('http://localhost:3002/rhizicube/test', message.payload.text).then(res => console.log('res :', res))
      }

      console.log('received', message)
    })

    //discord.login(config.discord.token)
    app.listen(3124)

    console.log('listening on port 3124')
  }
}
