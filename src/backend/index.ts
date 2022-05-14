import * as fs from 'fs'
import { Mongo } from './db/mongo'
import { Api } from './api/express'
import { Socket } from './socket/socket'
import { deleteUser, User } from './db/models/user'
import { Chat } from './twitch/chat'
import { RefreshingAuthProvider } from '@twurple/auth'
import { Settings } from './db/models/settings'
import { Twitch } from './twitch/twitch'
import { UserToken } from './db/models/tokens'
import * as Mongoose from 'mongoose'

//@ts-ignore
export const PORT: number = process.env.PORT || 3000

export const MONGO = JSON.parse('' + fs.readFileSync('mongo_credentials.json'))

export var channelID

let startApp = async () => {
  console.info('CONNECTING TO DATABASE...')

  await Mongo.connect()

  console.info('CONNECTING TO TWITCH...')

  await Twitch.init()
  let admin: any = await User.findOne({ admin: true })
  let defaultUserToken: any = await UserToken.findOne({ userId: admin._id })
  Chat.defaultUserProvider = new RefreshingAuthProvider(
    {
      clientId: Mongo.clientId,
      clientSecret: Mongo.clientSecret,
      onRefresh: async (token) => {
        let defaultUserToken: any = await UserToken.findOne({ userId: admin._id })
        defaultUserToken.accessToken = token.accessToken
        defaultUserToken.refreshToken = token.refreshToken
        defaultUserToken.expiresIn = token.expiresIn
        defaultUserToken.obtainmentTimestamp = Date.now()
        await defaultUserToken.save()
      },
    },
    defaultUserToken.toJSON()
  )

  console.info('STARTING WEB SERVER...')

  new Api()
  new Socket()

  console.info('SERVER INITIALIZED. ACTIVATING USER SERVICES...')

  let users = await User.find().sort({ lastLogin: -1 })
  for (let user of users) {
    let s = await Settings.findOne({ userId: user._id })
    if (!s) continue

    console.info(`Processing user ${user.twitchDisplayName}...`)

    let ss = s.json
    if (ss.api.enabled) {
      console.info(`Enabling APIs for user ${user.twitchDisplayName}...`)
      try {
        await Twitch.connect(user.toJSON(), ss)
      } catch (e: any) {
        if (e._statusCode === 403) {
          console.error('User appears to have manually removed permissions, deleting...', user)
          await deleteUser(s.userId)
          continue
        }
      }
    }
    if (ss.chatbot.enabled) {
      console.info(`Enabling chatbot for user ${user.twitchDisplayName}...`)
      try {
        await Chat.connect(user.toJSON(), ss)
      } catch (e) {
        console.error('User appears to have manually removed permissions, deleting...', user)
        await deleteUser(s.userId)
        continue
      }
    }
  }

  console.info('SERVER STARTED SUCCESSFULLY...')
}
startApp()

process.on('SIGINT', async () => {
  console.info('SAFELY QUITTING APPLICATION...')
  for (let iClient of Twitch.clients)
    if (iClient.subscriptions)
      for (let sub of iClient.subscriptions)
        try {
          await sub.subscription.stop()
        } catch (e) {
          console.error(e)
        }
  try {
    await Twitch.listener.unlisten()
  } catch (e) {
    console.error(e)
  }
  try {
    await Mongoose.disconnect()
  } catch (e) {
    console.error(e)
  }
  console.info('SAFELY CLOSED APPLICATION...')
  process.exit(0)
})
