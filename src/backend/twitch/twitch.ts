import { ApiClient, HelixChannelSearchResult, HelixStream, HelixUser } from '@twurple/api'
import { DirectConnectionAdapter, EventSubListener, EventSubSubscription } from '@twurple/eventsub'
import { from, Subject } from 'rxjs'
import * as fs from 'fs'
import { filter, take } from 'rxjs/operators'

import { ENDPOINT } from '../index'
import { HypeTrain } from '../socket/events/hypetrain'
import { Cheers } from '../socket/events/cheers'
import { ClientCredentialsAuthProvider, RefreshingAuthProvider, TokenInfo } from '@twurple/auth'
import { Mongo } from '../db/mongo'
import { UserToken, ClientToken } from '../db/models/tokens'
export class Twitch {
  
  static client: ApiClient
  static listener: EventSubListener
  static clientReady: Subject<any>
  static clients: IApiClient[] = []
  
  static async find(userId) {
    return await from(Twitch.clients).pipe(filter(c => c.userId.toString() === userId.toString())).toPromise()
  }

  private static async prepareClient() {
    Twitch.client = new ApiClient({
      authProvider: new ClientCredentialsAuthProvider(Mongo.clientId, Mongo.clientSecret)
    })
    let token: any = await ClientToken.findOne()
    await Twitch.client.eventSub.deleteAllSubscriptions()
    Twitch.listener = new EventSubListener({
      apiClient: Twitch.client,
      adapter: new DirectConnectionAdapter({
        hostName: ENDPOINT.hostname,
        sslCert: {
          cert: `${fs.readFileSync(ENDPOINT.crt)}`,
          key: `${fs.readFileSync(ENDPOINT.key)}`,
        },
      }),
      secret: token.secret,
    })
    await Twitch.listener.listen(3001)
    process.on('SIGINT', () => {
      for(let iClient of Twitch.clients) 
        for(let sub of iClient.subscriptions)
          sub.stop()
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

    if(await this.find(user._id))
      throw new Error()

    let token: any = await UserToken.findOne({userId: user._id})
    let userClient = new ApiClient({
      authProvider: new RefreshingAuthProvider({
        clientId: Mongo.clientId,
        clientSecret: Mongo.clientSecret,
        onRefresh: async token => {
          let userToken: any = await UserToken.findOne({userId: user._id})
          userToken.accesToken = token.accessToken
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
    let subscriptions = []
    if(settings?.api?.listeners?.cheer) subscriptions.push(await Twitch.listener.subscribeToChannelCheerEvents(channel.id, Cheers.cheerEvent))    
    if(settings?.api?.listeners?.hypetrain) {
      subscriptions.push(await Twitch.listener.subscribeToChannelHypeTrainBeginEvents(channel.id, HypeTrain.hypeTrainBegin))
      subscriptions.push(await Twitch.listener.subscribeToChannelHypeTrainProgressEvents(channel.id, HypeTrain.hypeTrainProgress))
      subscriptions.push(await Twitch.listener.subscribeToChannelHypeTrainEndEvents(channel.id, HypeTrain.hypeTrainEnd)) 
    }


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
    let iClient = await this.find(user._id)
    if(iClient) {
      for(let sub of iClient.subscriptions) {
        sub.stop()
      }
      iClient.subscriptions = null
      Twitch.clients.splice(Twitch.clients.indexOf(iClient), 1)
    }
  }

}



export class IApiClient {
  userId: string
  user: HelixUser
  client: ApiClient
  userClient: ApiClient

  listener: EventSubListener
  subscriptions: EventSubSubscription[]

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