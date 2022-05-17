import { ChatClient } from '@twurple/chat/lib'
import { IChatClient } from '../twitch/chat'
import { User, IUser } from '../db/models/user'
import { Mongo } from '../db/mongo'

export const MAX_CHAT_MESSAGE_LENGTH: number = 500

export const filterParameters = (message) => {
  let parameters = message.split(' ')
  parameters.shift()
  return parameters
}

export class Message {
  iClient: IChatClient
  client: ChatClient
  user: IUser
  settings

  constructor(iClient) {
    this.iClient = iClient
    this.client = iClient.client
    this.settings = iClient.settings.chatbot.categories
    User.findById(Mongo.ObjectId(this.iClient.userId)).then((user) => (this.user = user.toJSON()))
  }

  private cooldowns = {}

  protected _init = () => {
    let keys: string[] = []
    for (let key of Object.keys(this)) if (typeof this[key] === 'function' && !key.startsWith('_')) keys.push(key)
    this.client.onMessage(async (channel, user, message, msg) => {
      for (let key of keys) this[key](channel, user, message, msg)
    })
  }

  protected _timeout = (timeInSeconds?: number, identifier?: string): boolean => {
    let caller = identifier
      ? identifier
      : new Error()
          .stack!.split('\n')[2]
          .replace(/^.*\.\_this\./, '')
          .replace(/ \(.*\)$/, '')
    if (timeInSeconds && Date.now() - this.cooldowns[caller] < timeInSeconds * 1000) {
      return true
    } else {
      this.cooldowns[caller] = Date.now()
      return false
    }
  }

  protected _replace = (message, user): string => {
    return message.replace(/\@user/, `@${user}`)
  }
}
