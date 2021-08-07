import { ApiClient, HelixChannelSearchResult, HelixStream, HelixUser } from '@twurple/api'
import { DirectConnectionAdapter, EventSubListener } from '@twurple/eventsub'
import { from } from 'rxjs'
import * as fs from 'fs'
import { filter, take } from 'rxjs/operators'

import { ENDPOINT } from '../index'
import { HypeTrain } from '../socket/events/hypetrain'
import { Cheers } from '../socket/events/cheers'
import { ClientCredentialsAuthProvider, RefreshingAuthProvider, TokenInfo } from '@twurple/auth'
import { Mongo } from '../db/mongo'
import { UserToken } from '../db/models/tokens'

export class Twitch {

  /* userId
  client: ApiClient
  listener: EventSubListener
  static channelID: HelixUser
  private static subscriptions = []
 */



  static clients: IApiClient[] = []
  
  static async find(userId) {
    return await from(Twitch.clients).pipe(filter(c => c.userId === userId.toString())).toPromise()
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

    let iClient = Object.assign(new IApiClient(), {
      userId: user._id,
      user: await client.users.getUserByName(user.twitchName), 
      client: client,
      userClient: userClient
    })
    Twitch.clients.push(iClient)
   
    
    //TODO FINISH
    console.log(ENDPOINT.hostname)
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
    await listener.listen(3001)
    let channel = await client.users.getUserByName('cakeums')
    console.log(channel)
    await listener.subscribeToChannelCheerEvents(channel.id, Cheers.cheerEvent)

    //

    //console.log(Twitch.channelID)
    //let res = (await await Twitch.client.hypeTrain.getHypeTrainEventsForBroadcaster(Twitch.channelID))
    //console.log(res)





    //await listener.subscribeToChannelCheerEvents(user._id, Cheers.cheerEvent)

    //Twitch.subscriptions.push(await Twitch.listener.subscribeToChannelHypeTrainBeginEvents(Twitch.channelID, HypeTrain.hypeTrainBegin))
    //Twitch.subscriptions.push(await Twitch.listener.subscribeToChannelHypeTrainProgressEvents (Twitch.channelID, HypeTrain.hypeTrainProgress))
    //Twitch.subscriptions.push(await Twitch.listener.subscribeToChannelHypeTrainEndEvents (Twitch.channelID, HypeTrain.hypeTrainEnd))

    /* process.on('SIGINT', () => {
      for(let sub of Twitch.subscriptions)
        sub.stop()
    }) */

  }

  static async disconnect(user) {
  
  }

}



export class IApiClient {
  userId: string
  user: HelixUser
  client: ApiClient
  userClient: ApiClient

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