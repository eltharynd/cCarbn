import { ApiClient, HelixChannelSearchResult, HelixStream, HelixUser } from '@twurple/api'
import { DirectConnectionAdapter, EventSubListener, EventSubSubscription } from '@twurple/eventsub'
import { from } from 'rxjs'
import * as fs from 'fs'
import { filter, take } from 'rxjs/operators'

import { ENDPOINT } from '../index'
import { HypeTrain } from '../socket/events/hypetrain'
import { Cheers } from '../socket/events/cheers'
import { ClientCredentialsAuthProvider, RefreshingAuthProvider, TokenInfo } from '@twurple/auth'
import { Mongo } from '../db/mongo'
import { UserToken } from '../db/models/tokens'

process.on('SIGINT', () => {
  for(let iClient of Twitch.clients) {
    for(let sub of iClient.subscriptions)
      sub.stop()
    if(iClient.listener)
      iClient.listener.unlisten() 
  }
})
export class Twitch {

  /* userId
  client: ApiClient
  listener: EventSubListener
  static channelID: HelixUser
  private static subscriptions = []
 */

  

  static clients: IApiClient[] = []
  
  static async find(userId) {
    return await from(Twitch.clients).pipe(filter(c => c.userId.toString() === userId.toString())).toPromise()
  }

  static async connect(user, settings?) {
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

    let client = new ApiClient({
      authProvider: new ClientCredentialsAuthProvider(Mongo.clientId, Mongo.clientSecret)
    })

    let listener = new EventSubListener({
      apiClient: client,
      adapter: new DirectConnectionAdapter({
        hostName: ENDPOINT.hostname,
        sslCert: {
          cert: `${fs.readFileSync(ENDPOINT.crt)}`,
          key: `${fs.readFileSync(ENDPOINT.key)}`,
        },
      }),
      secret: token.secret,
    })
    //TODO do this better (this will crash)
    await listener.listen(3001 + Twitch.clients.length)

    let channel = await client.users.getUserByName(user.twitchName)

    let subscriptions = []
    try {
      subscriptions.push(await listener.subscribeToChannelCheerEvents(channel.id, Cheers.cheerEvent))
      subscriptions.push(await listener.subscribeToChannelHypeTrainBeginEvents(channel.id, HypeTrain.hypeTrainBegin))
      subscriptions.push(await listener.subscribeToChannelHypeTrainProgressEvents(channel.id, HypeTrain.hypeTrainProgress))
      subscriptions.push(await listener.subscribeToChannelHypeTrainEndEvents(channel.id, HypeTrain.hypeTrainEnd))
    } catch(e) {
      console.error(e)
    }


    let iClient = Object.assign(new IApiClient(), {
      userId: user._id,
      user: channel, 
      client: client,
      userClient: userClient,
      listener: listener,
      subscriptions: subscriptions
    })
    Twitch.clients.push(iClient)

    //await userClient.hypeTrain.getHypeTrainEventsForBroadcaster(channel.id)
  }

  static async disconnect(user) {
    let iClient = await this.find(user._id)
    if(iClient) {
      if(iClient.listener)
        await iClient.listener.unlisten() 
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