
import { ClientCredentialsAuthProvider, RefreshingAuthProvider } from '@twurple/auth'
import * as fs from 'fs'

import { Mongo } from './db/mongo'
import { Socket } from './hooks/socket'

import { Twitch } from './twitch/twitch'

import { Chat } from './twitch/chat'
import { Common } from './messages/categories/common'
import { Everyone } from './messages/categories/everyone'
import { Moderators } from './messages/categories/moderators'
import { Storeable } from './messages/categories/storeable'

//TODO use this port in init.js too
export const PORT = 3000

export const CREDENTIALS = JSON.parse('' + fs.readFileSync('twitch_credentials.json'))
export const MONGO = JSON.parse('' + fs.readFileSync('mongo_credentials.json'))
export const ENDPOINT = JSON.parse('' + fs.readFileSync('endpoint_credentials.json'))

export const clientProvider = new ClientCredentialsAuthProvider(CREDENTIALS.clientId, CREDENTIALS.clientSecret)
export const userProvider = new RefreshingAuthProvider({
  clientId: CREDENTIALS.clientId,
  clientSecret: CREDENTIALS.clientSecret,
  onRefresh: token => {
    let newToken = JSON.parse('' + fs.readFileSync('twitch_credentials.json'))

    if(token.accessToken) newToken.accessToken
    if(token.refreshToken) newToken.refreshToken
    if(token.expiresIn) newToken.expiresIn
    if(token.obtainmentTimestamp) newToken.obtainmentTimestamp

    fs.writeFileSync('twitch_credentials.json', JSON.stringify(newToken, null, 4))
  }
}, CREDENTIALS)


export var channelID

let startApp = async () => {
  await Twitch.init()
  channelID = await Twitch.client.users.getUserByName(CREDENTIALS.channel)
  await Chat.init()

  new Common()
  new Everyone()
  new Moderators()

  await Mongo.connect()
  new Storeable()

}
startApp()







//DELETE WHATS BELOW




/* 
const authProvider = new RefreshableAuthProvider(new StaticAuthProvider(CREDENTIALS.clientId, CREDENTIALS.accessToken), {
  clientSecret: CREDENTIALS.clientSecret,
  refreshToken: CREDENTIALS.accessToken,
  expiry: CREDENTIALS.obtainmentTimestamp + CREDENTIALS.expiresIn,
  onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
    console.log('---------------------------------- NEW TOKEN DATA RECEIVED (INDEX) ----------------------------------')
    let newCredentials = JSON.parse(`${fs.readFileSync('twitch_credentials.json')}`)
    newCredentials.accessToken = accessToken
    newCredentials.refreshToken = refreshToken
    newCredentials.expiresIn = expiryDate?.getTime() - Date.now()
    newCredentials.obtainmentTimestamp = Date.now()
    fs.writeFileSync('twitch_credentials.json', JSON.stringify(newCredentials, null, 4))
  },
})


const client = new tmi.Client({
  options: {
    debug: true,
    messagesLogLevel: 'error',
  },
  connection: {
    reconnect: true,
    secure: true,
  },
  authProvider: authProvider,
  channels: [CREDENTIALS.channel],
})

client
  .disconnect()
  .then((value) => {

    new Common(client)
    new Everyone(client)
    new Moderators(client)

    let socket = new Socket(PORT, [])
    //@ts-ignore
    client.socket = socket.io

    new Mongo(() => {
      new Saved(client)
    })
  })
  .catch((reason) => {
    console.log(`Could not connect to twitch chat for reason: ${reason}`)
  }) */