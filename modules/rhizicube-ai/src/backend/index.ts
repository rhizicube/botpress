import { MessagingClient } from '@botpress/messaging-client'
import { Application } from 'express'
import express = require('express')
//import { EventEmitter } from 'node:events'
import axios from 'axios'
import {v4 as uuidv4} from 'uuid'

const app: Application = express()
app.use(express.json())

app.use(express.urlencoded({extended: true}))
app.use(express.json())
// class MyEmitter extends EventEmitter {}
// const myEmitter = new MyEmitter()

let jwtToken

const login = async () => {
  const user = {
    email: 'abhinav@rhizicube.ai',
    password: 'hareram@91'
  }
  const value = await axios.post('http://localhost:3000/api/v1/auth/login/basic/default', user)
  console.log('value', value.data)
  jwtToken = value.data.payload.jwt
}
void login()

const config = {
  messaging: {
  url: 'http://localhost:3100',
  clientId: '',
  clientToken: jwtToken
}
}

const messaging = new MessagingClient({ ...config.messaging })
messaging.setup(app, '/callback')


const obj = {
  url: 'http://localhost:3124/callback',
  token: jwtToken
}
const obj2 = {
  webhooks: [obj],
  channels: ['rhizicube-ai']
}
messaging
  .sync(obj2)
  .then(res => console.log('msg', res))
  .catch(err => console.log('Error',err))

  console.log('Hi ')
// let myuuid = uuidv4();
// const clientid = {
//   "id" : myuuid
// }
// const configs = {
//   //"channels": "rhizicube-ai",
//   "url": "http://localhost:3100",
//   //"token" : "3ea98c72-2d34-4c4e-8e3a-3d9190101acb.NlnKi10MLrGJd7J79zmorwKSfle3BPtM8+xu1Iy0EYIHTFTnDvOjoyBmQODnOOY/Uw1oh+oTX+9GXNXLVsz4p7DX"
// }
// messaging.createUserToken(myuuid).then(res => console.log("res :",res))
// console.log("client id :", myuuid)
// let generateToken = axios.post("http://localhost:3100/api/v1/sync", 'e74629ca-3ce4-4371-95f1-aaeb664f31b4',configs ).then((res) => console.log(res.data)).catch(err => console.error(err))
// generateToken.then()
//axios.post("http://localhost:3100/api/v1/sync", 'e74629ca-3ce4-4371-95f1-aaeb664f31b4', config.messaging ).then((res) => console.log('resp',res.data.data.data))





messaging.on('message', async ({ message }) => {
  console.log('messaging.on')
  if (message.authorId) {
    console.log('auth', message)
    // we ingore user messages
    return
  }

  // we get back our endpoint using the conversation id
  const [endpoint] = await messaging.listEndpoints(message.conversationId)

  // send message to that endpoint
  // const channel = discord.channels.cache.get(endpoint.thread) as TextChannel

  if (message.payload.type === 'text') {
  //   await channel.send({ content: message.payload.title, files: [message.payload.image] })
  await axios.post('http://localhost:3002/rhizicube/test', message).then(res => console.log( 'res :' ,res))
  }

  console.log('received', message)
})

//discord.login(config.discord.token)
app.listen(3124)

console.log('listening on port 3124')
