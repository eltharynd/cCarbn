import { ChatClient } from '@twurple/chat'
import { from } from 'rxjs'
import { filter, take } from 'rxjs/operators'
import { Settings } from '../db/models/settings'

import { Common } from '../messages/categories/common'
import { Everyone } from '../messages/categories/everyone'
import { Moderators } from '../messages/categories/moderators'
import { Pokemon } from '../messages/categories/pokemon'
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
      client: client,
      //@ts-ignore
      settings: settings? settings : (await Settings.findOne({userId: user._id}).json)
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
    if(settings?.chatbot?.categories?.common?.enabled) new Common(iClient)
    if(settings?.chatbot?.categories?.everyone?.enabled) new Everyone(iClient)
    if(settings?.chatbot?.categories?.moderators?.enabled) new Moderators(iClient)
    if(settings?.chatbot?.categories?.pokemon?.enabled) new Pokemon(iClient)
    if(settings?.chatbot?.categories?.storeable?.enabled) new Storeable(iClient)
  }

  static async toggleCategory(user, category: Category, enable, settings) {
    let iClient = await this.find(user._id)
    if(!iClient && enable) {
      throw new Error(`User doesn't have a connected client...`)

    } else  {
      if(enable) {
        //TODO check if already connected
        switch(category) {
          case Category.common:
            new Common(iClient)
            break
          case Category.everyone:
            new Everyone(iClient)
            break
          case Category.moderators:
            new Moderators(iClient)
            break
          case Category.pokemon:
            new Pokemon(iClient)
            break
          case Category.storeable:
            new Storeable(iClient)
            break
        } 
      } else {
        await iClient.client.quit()
        iClient.client = await this.connectToUser(user)
        await this.bindCategories(iClient, settings)
      }
    }
  }

}



export class IChatClient {
  userId: string
  client: ChatClient
}

export enum Category {
  common,
  everyone,
  moderators,
  pokemon,
  storeable
}