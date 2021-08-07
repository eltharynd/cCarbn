import { RefreshingAuthProvider } from '@twurple/auth/lib'
import { ChatClient } from '@twurple/chat'
import { DefaultUserToken } from '../db/models/tokens'
import { User } from '../db/models/user'
import { Mongo } from '../db/mongo'
import { from } from 'rxjs'
import { filter } from 'rxjs/operators'

import { Common } from '../messages/categories/common'
import { Everyone } from '../messages/categories/everyone'
import { Moderators } from '../messages/categories/moderators'
import { Storeable } from '../messages/categories/storeable'
 
export class Chat {

  static clients: IChatClient[] = []
  static defaultUserProvider

  private static async find(userId) {
    return await from(Chat.clients).pipe(filter(c => c.userId === userId.toString())).toPromise()
  }

  static async connect(user, settings?) {
    if(await Chat.find(user._id))
      throw new Error()

    let client = new ChatClient({
      authProvider: Chat.defaultUserProvider,
      channels: [user.twitchName],
      requestMembershipEvents: true,
      logger: {
        minLevel: 'info'
      }
    })
    let iClient = {
      userId: user._id.toString(),
      client: client
    }
    Chat.clients.push(iClient)
    client.connect()

    //TODO migrate this to settings and connect/reconnect accordingly
    new Common(iClient)
    new Everyone(iClient)
    new Moderators(iClient)
    new Storeable(iClient)
  }

  static async disconnect(user) {
    let found = await this.find(user._id)
    if(found) {
      found.client.quit() 
      Chat.clients.splice(Chat.clients.indexOf(found), 1)
    }
  }

}



export class IChatClient {
  userId: string
  client: ChatClient
}