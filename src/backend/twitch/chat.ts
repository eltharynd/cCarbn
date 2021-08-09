import { ChatClient } from '@twurple/chat'
import { from } from 'rxjs'
import { filter, take } from 'rxjs/operators'
import { Settings } from '../db/models/settings'

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
      throw new Error(`User doesn't have a connected client...`)

    let client = await this.connectToUser(user)
    let iClient = {
      userId: user._id.toString(),
      client: client
    }
    Chat.clients.push(iClient)
    await this.bindCategories(iClient, settings)
  }

  static async disconnect(user, settings?) {
    let iClient = await this.find(user._id)
    if(iClient) {
      await iClient.client.quit() 
      Chat.clients.splice(Chat.clients.indexOf(iClient), 1)
    }

  }


  static async connectToUser(user) {
    let chatClient = new ChatClient({
      authProvider: Chat.defaultUserProvider,
      channels: [user.twitchName],
      requestMembershipEvents: true,
      logger: {
        minLevel: 'info'
      }
    })
    chatClient.connect()
    return chatClient
  }

  static async bindCategories(iClient, settings) {
    if(settings?.chatbot?.categories?.common) new Common(iClient)
    if(settings?.chatbot?.categories?.everyone) new Everyone(iClient)
    if(settings?.chatbot?.categories?.moderators) new Moderators(iClient)
    if(settings?.chatbot?.categories?.storeable) new Storeable(iClient)
  }

  static async toggleCategory(user, category: Category, enable) {
    let iClient = await this.find(user._id)
    if(!iClient && enable) {
      throw new Error(`User doesn't have a connected client...`)

    } else  {
      if(enable) {
        //TODO check if already connected
        switch(category) {
          case Category.Common:
            new Common(iClient)
            break
          case Category.Everyone:
            new Everyone(iClient)
            break
          case Category.Moderators:
            new Moderators(iClient)
            break
          case Category.Storeable:
            new Storeable(iClient)
            break
        } 
      } else {
        iClient.client.quit()
        iClient.client = await this.connectToUser(user)
        let settings: any = await Settings.findOne({userId: user._id})
        await this.bindCategories(iClient, settings.json)
      }
    }
  }

}



export class IChatClient {
  userId: string
  client: ChatClient
}

export enum Category {
  Common,
  Everyone,
  Moderators,
  Storeable
}