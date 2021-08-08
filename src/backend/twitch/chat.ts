import { ChatClient } from '@twurple/chat'
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
    return await from(Chat.clients).pipe(filter(c => c.userId.toString() === userId.toString())).toPromise()
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
    if(settings?.chatbot?.categories?.common) new Common(iClient)
    if(settings?.chatbot?.categories?.everyone) new Everyone(iClient)
    if(settings?.chatbot?.categories?.moderators) new Moderators(iClient)
    if(settings?.chatbot?.categories?.storeable) new Storeable(iClient)
  }

  static async disconnect(user, settings?) {
    let iClient = await this.find(user._id)
    if(iClient) {
      await iClient.client.quit() 
      Chat.clients.splice(Chat.clients.indexOf(iClient), 1)
    }

  }

}



export class IChatClient {
  userId: string
  client: ChatClient
}
