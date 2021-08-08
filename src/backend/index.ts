import * as fs from 'fs'
import { Mongo } from './db/mongo'
import { Api } from './api/express'
import { Socket } from './socket/socket'
import { Administrator, User } from './db/models/user'
import { DefaultClientToken, DefaultUserToken, UserToken } from './db/models/tokens'
import { Chat } from './twitch/chat'
import { RefreshingAuthProvider } from '@twurple/auth'
import { Command } from './db/models/command'
import { Settings } from './db/models/settings'
import { Twitch } from './twitch/twitch'

export const PORT = 3000

export const MONGO = JSON.parse('' + fs.readFileSync('mongo_credentials.json'))
export const ENDPOINT = JSON.parse('' + fs.readFileSync('endpoint_credentials.json'))

export var channelID

let startApp = async () => {

  await Mongo.connect()

  new Api()
  new Socket()

  let defaultUserToken: any = await DefaultUserToken.findOne()
  Chat.defaultUserProvider = new RefreshingAuthProvider(
    {
      clientId: Mongo.clientId,
      clientSecret: Mongo.clientSecret,
      onRefresh: async (token) => {
        let defaultUserToken: any = await DefaultUserToken.findOne()
        defaultUserToken.accesToken = token.accessToken
        defaultUserToken.refreshToken = token.refreshToken
        defaultUserToken.expiresIn = token.expiresIn
        defaultUserToken.obtainmentTimestamp = Date.now()
        await defaultUserToken.save()
      },
    },
    defaultUserToken.toJSON()
  )
  let settings: any[] = await Settings.find()
  for(let s of settings) {
    let user: any = await User.findOne({_id: s.userId})
    let settings = s.json
    if(settings.api) {
      Twitch.connect(user.toJSON(), settings)
    }
    if(settings.chatbot) {
      Chat.connect(user.toJSON(), settings)
    }
  }
}
startApp()
