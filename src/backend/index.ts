import { ClientCredentialsAuthProvider, RefreshingAuthProvider } from '@twurple/auth'
import * as fs from 'fs'

import { Mongo } from './db/mongo'
import { Api } from './api/express'
import { Socket } from './socket/socket'

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
export const userProvider = new RefreshingAuthProvider(
  {
    clientId: CREDENTIALS.clientId,
    clientSecret: CREDENTIALS.clientSecret,
    onRefresh: (token) => {
      let newToken = JSON.parse('' + fs.readFileSync('twitch_credentials.json'))
      if (token.accessToken) newToken.accessToken = token.accessToken
      if (token.refreshToken) newToken.refreshToken = token.refreshToken
      if (token.expiresIn) newToken.expiresIn = token.expiresIn
      if (token.obtainmentTimestamp) newToken.obtainmentTimestamp = token.obtainmentTimestamp

      fs.writeFileSync('twitch_credentials.json', JSON.stringify(newToken, null, 4))
    },
  },
  CREDENTIALS
)

export var channelID

let startApp = async () => {

  await Mongo.connect()

  new Api()
  new Socket()


  //await Twitch.init()
  //await Chat.init()

  //new Common()
  //new Everyone()
  //new Moderators()
  //new Storeable()
}
startApp()
