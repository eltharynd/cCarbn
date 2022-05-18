import { ChatClient } from '@twurple/chat'
import { from } from 'rxjs'
import { filter, take } from 'rxjs/operators'
import { Settings } from '../db/models/settings.model'

import { Common } from '../messages/categories/common.messages'
import { Self } from '../messages/categories/self.messages'
import { Moderators } from '../messages/categories/moderators.messages'
import { Pokemon } from '../messages/categories/pokemon.messages'
import { Storeable } from '../messages/categories/storeable.messages'
import { Socket } from '../socket/socket'
import { Twitch } from './twitch'
import { getUserInfo } from '../socket/events/util/eventUtils'

export class Chat {
  static clients: IChatClient[] = []
  static defaultUserProvider

  private static async find(userId) {
    return await from(Chat.clients)
      .pipe(filter((c) => c.userId.toString() === userId.toString()))
      .toPromise()
  }

  static async connect(user, settings?) {
    if (await Chat.find(user._id)) throw new Error(`User doesn't have a connected client...`)

    let client = await this.connectToUser(user)
    let iClient = {
      userId: user._id.toString(),
      channel: client.channel,
      client: client.client,
      //@ts-ignore
      settings: settings ? settings : await Settings.findOne({ userId: user._id }).json,
      usersWhoTalked: [],
      vips: {},
    }

    iClient.client.onMessage(async (channel, user, message, msg) => {
      if (!iClient.usersWhoTalked.includes(user)) {
        iClient.usersWhoTalked.push(user)

        //TODO bother twitch until they add a VIP request to the API and do this shit properly
        iClient.vips[user] = msg.userInfo.isVip
        let sender = await Twitch.client.users.getUserByName(user)
        if (sender)
          Socket.io.to(iClient.userId).emit('alerts', {
            type: 'First Message',
            user_id: sender.id,
            user_login: sender.name,
            user_name: sender.displayName,
            userInfo: await getUserInfo(channel.replace(/\#/gi, ''), sender, { vip: msg.userInfo.isVip }),
          })
      }
    })

    Chat.clients.push(iClient)

    await this.bindCategories(iClient, settings)
  }

  static async disconnect(user, settings?) {
    let iClient = await this.find(user._id)
    if (iClient) {
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
        minLevel: 'info',
      },
    })
    chatClient.connect()
    return { channel: user.twitchName, client: chatClient }
  }

  static async bindCategories(iClient, settings) {
    if (settings?.chatbot?.categories?.self?.enabled) new Self(iClient)
    if (settings?.chatbot?.categories?.common?.enabled) new Common(iClient)
    if (settings?.chatbot?.categories?.moderators?.enabled) new Moderators(iClient)
    if (settings?.chatbot?.categories?.pokemon?.enabled) new Pokemon(iClient)
    if (settings?.chatbot?.categories?.storeable?.enabled) new Storeable(iClient)
  }

  static async toggleCategory(user, category: Category, enable, settings) {
    let iClient = await this.find(user._id)
    if (!iClient && enable) {
      throw new Error(`User doesn't have a connected client...`)
    } else {
      if (enable) {
        switch (category) {
          case Category.self:
            new Self(iClient)
            break
          case Category.common:
            new Common(iClient)
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
        await iClient!.client.quit()
        iClient!.client = (await this.connectToUser(user)).client
        iClient!.channel = (await this.connectToUser(user)).channel
        await this.bindCategories(iClient, settings)
      }
    }
  }
}

export class IChatClient {
  /** cCarbn clientId */
  userId: string
  channel: string
  client: ChatClient
  usersWhoTalked: string[] = []
  vips: {}
}

export enum Category {
  self,
  common,
  moderators,
  pokemon,
  storeable,
}
