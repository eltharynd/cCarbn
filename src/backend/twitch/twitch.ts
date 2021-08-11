import { ApiClient, HelixChannelSearchResult, HelixStream, HelixUser } from '@twurple/api'
import { DirectConnectionAdapter, EventSubChannelHypeTrainBeginEvent, EventSubListener, EventSubSubscription, ReverseProxyAdapter } from '@twurple/eventsub'
import { from, Subject } from 'rxjs'
import * as fs from 'fs'
import { filter, take, toArray } from 'rxjs/operators'

import { ENDPOINT, PORT } from '../index'
import { HypeTrain } from '../socket/events/hypetrain'
import { Cheers } from '../socket/events/cheers'
import { ClientCredentialsAuthProvider, RefreshingAuthProvider, TokenInfo } from '@twurple/auth'
import { Mongo } from '../db/mongo'
import { UserToken, ClientToken } from '../db/models/tokens'
import { User } from '../db/models/user'
export class Twitch {
  
  static client: ApiClient
  static listener: EventSubListener
  static clientReady: Subject<any>
  static clients: IApiClient[] = []
  
  static async findByUserId(userId) {
    return await from(Twitch.clients).pipe(filter(c => c.userId.toString() === userId.toString())).toPromise()
  }

  static async findByChannel(channel: HelixUser) {
    let user: any = await User.findOne({twitchId: channel.id.toString()})
    return await from(Twitch.clients).pipe(filter(c => c.userId.toString() === user._id.toString())).toPromise()
  }

  private static async prepareClient() {
    Twitch.client = new ApiClient({
      authProvider: new ClientCredentialsAuthProvider(Mongo.clientId, Mongo.clientSecret)
    })
    let token: any = await ClientToken.findOne()
    await Twitch.client.eventSub.deleteAllSubscriptions()
    Twitch.listener = new EventSubListener({
      apiClient: Twitch.client,
      //TODO ReverseProxyAdapter instead?
      adapter: process?.env?.NODE_ENV === 'production' ? 
        new ReverseProxyAdapter({
            hostName: ENDPOINT.hostname
        }) : 
        new DirectConnectionAdapter({
          hostName: ENDPOINT.hostname,
          sslCert: {
            cert: `${fs.readFileSync(ENDPOINT.crt)}`,
            key: `${fs.readFileSync(ENDPOINT.key)}`,
          },
        }),
      secret: token.secret,
    })
    await Twitch.listener.listen(+PORT + 1)
    process.on('SIGINT', () => {
      for(let iClient of Twitch.clients) 
        for(let sub of iClient.subscriptions)
          sub.subscription.stop()
    })
  }


  static async connect(user, settings?) {

    if(!Twitch.client) {
      if(Twitch.clientReady)
        await Twitch.clientReady.toPromise()
      else
        Twitch.clientReady = new Subject()

      await this.prepareClient()
      Twitch.clientReady.complete()
    }

    if(await this.findByUserId(user._id))
      throw new Error()

    let token: any = await UserToken.findOne({userId: user._id})
    let userClient = new ApiClient({
      authProvider: new RefreshingAuthProvider({
        clientId: Mongo.clientId,
        clientSecret: Mongo.clientSecret,
        onRefresh: async token => {
          let userToken: any = await UserToken.findOne({userId: user._id})
          userToken.accessToken = token.accessToken
          userToken.refreshToken = token.refreshToken
          userToken.expiresIn = token.expiresIn
          userToken.obtainmentTimestamp = Date.now()
          await userToken.save()
          }
        },
        token.toJSON()
      )
    }) 


    let channel = await Twitch.client.users.getUserByName(user.twitchName)
    let subscriptions = await Twitch.bindListeners(channel, settings)


    let iClient = Object.assign(new IApiClient(), {
      userId: user._id,
      user: channel, 
      client: Twitch.client,
      userClient: userClient,
      listener: Twitch.listener,
      subscriptions: subscriptions
    })
    Twitch.clients.push(iClient)

    //await userClient.hypeTrain.getHypeTrainEventsForBroadcaster(channel.id)
  }

  static async disconnect(user, settings?) {
    let iClient = await this.findByUserId(user._id)
    if(iClient) {
      for(let sub of iClient.subscriptions) {
        sub.subscription.stop()
      }
      iClient.subscriptions = null
      Twitch.clients.splice(Twitch.clients.indexOf(iClient), 1)
    }
  }

  static async bindListeners(channel: HelixUser, settings) {
    let subscriptions: {listener: Listeners, subscription: EventSubSubscription}[] = []
    if(settings?.api?.listeners?.cheer) subscriptions.push({listener: Listeners.cheer, subscription: await Twitch.listener.subscribeToChannelCheerEvents(channel.id, Cheers.cheerEvent)})    
    if(settings?.api?.listeners?.hypetrain) {
      subscriptions.push({listener: Listeners.hypetrain, subscription: await Twitch.listener.subscribeToChannelHypeTrainBeginEvents(channel.id, HypeTrain.hypeTrainBegin)})
      subscriptions.push({listener: Listeners.hypetrain, subscription: await Twitch.listener.subscribeToChannelHypeTrainProgressEvents(channel.id, HypeTrain.hypeTrainProgress)})
      subscriptions.push({listener: Listeners.hypetrain, subscription: await Twitch.listener.subscribeToChannelHypeTrainEndEvents(channel.id, HypeTrain.hypeTrainEnd)}) 
    }
    return subscriptions
  }

  static async toggleListener(channel: HelixUser, listener: Listeners, enable, settings) {
    let iClient = await this.findByChannel(channel)
    if(!iClient && enable) {
      throw new Error(`User doesn't have a connected client...`)

    } else  {
      if(enable) {
        switch(listener) {
          case Listeners.cheer:
            iClient.subscriptions.push({listener: Listeners.cheer, subscription: await Twitch.listener.subscribeToChannelCheerEvents(channel.id, Cheers.cheerEvent)})
            break
          case Listeners.hypetrain:
            iClient.subscriptions.push({listener: Listeners.hypetrain, subscription: await Twitch.listener.subscribeToChannelHypeTrainBeginEvents(channel.id, HypeTrain.hypeTrainBegin)})
            iClient.subscriptions.push({listener: Listeners.hypetrain, subscription: await Twitch.listener.subscribeToChannelHypeTrainProgressEvents(channel.id, HypeTrain.hypeTrainProgress)})
            iClient.subscriptions.push({listener: Listeners.hypetrain, subscription: await Twitch.listener.subscribeToChannelHypeTrainEndEvents(channel.id, HypeTrain.hypeTrainEnd)}) 
            break
        } 
      } else {
        let toRemove: {listener: Listeners, subscription: EventSubSubscription}[] = await from(iClient.subscriptions).pipe(
          filter(s => s.listener === listener),
          toArray()
        ).toPromise()
        for(let sub of toRemove) {
          await sub.subscription.stop()
          iClient.subscriptions.splice(iClient.subscriptions.indexOf(sub), 1)
        }
      }
    }
  }

}



export class IApiClient {
  userId: string
  user: HelixUser
  client: ApiClient
  userClient: ApiClient

  listener: EventSubListener
  subscriptions: {listener: Listeners, subscription: EventSubSubscription}[]

  searchChannel = async (name): Promise<HelixChannelSearchResult> => {
    return await from((await this.client.search.searchChannels(name)).data)
    .pipe(
      filter((channel) => channel.name === name),
      take(1)
    )
    .toPromise() 
  }

  getStream = async (userId): Promise<HelixStream> => {
    return await this.client.streams.getStreamByUserId(userId)
  }
}

export enum Listeners {
  ban,
  cheer,
  follow,
  hypetrain,
  moderator,
  poll,
  prediction,
  raid,
  redemption,
  reward,
  subscription,
  update,
  online,
}