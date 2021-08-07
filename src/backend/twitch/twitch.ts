import { ApiClient, HelixChannelSearchResult, HelixStream, HelixUser } from '@twurple/api'
import { DirectConnectionAdapter, EventSubListener } from '@twurple/eventsub'
import { from } from 'rxjs'
import * as fs from 'fs'
import { filter, take } from 'rxjs/operators'

import { clientProvider, CREDENTIALS, ENDPOINT, userProvider } from '../index'
import { HypeTrain } from '../socket/events/hypetrain'
import { Cheers } from '../socket/events/cheers'

export class Twitch {
  static client: ApiClient
  static listener: EventSubListener

  static channelID: HelixUser

  private static subscriptions = []
  
  public static async init() {

    /* Twitch.client = new ApiClient({
      authProvider: userProvider,
    })  */


    /* Twitch.listener = new EventSubListener({
      apiClient: Twitch.client,
      adapter: new DirectConnectionAdapter({
        hostName: ENDPOINT.hostname,
        sslCert: {
          cert: `${fs.readFileSync(ENDPOINT.crt)}`,
          key: `${fs.readFileSync(ENDPOINT.key)}`,
        },
      }),
      secret: CREDENTIALS.secret,
    })
    await Twitch.listener.listen(3001) */

    //Twitch.channelID = await Twitch.client.users.getUserByName(CREDENTIALS.channel)

    //console.log(Twitch.channelID)
    //let res = (await await Twitch.client.hypeTrain.getHypeTrainEventsForBroadcaster(Twitch.channelID))
    //console.log(res)





    //Twitch.subscriptions.push(await Twitch.listener.subscribeToChannelCheerEvents(Twitch.channelID, Cheers.cheerEvent))

    //Twitch.subscriptions.push(await Twitch.listener.subscribeToChannelHypeTrainBeginEvents(Twitch.channelID, HypeTrain.hypeTrainBegin))
    //Twitch.subscriptions.push(await Twitch.listener.subscribeToChannelHypeTrainProgressEvents (Twitch.channelID, HypeTrain.hypeTrainProgress))
    //Twitch.subscriptions.push(await Twitch.listener.subscribeToChannelHypeTrainEndEvents (Twitch.channelID, HypeTrain.hypeTrainEnd))

    process.on('SIGINT', () => {
      for(let sub of Twitch.subscriptions)
        sub.stop()
    })

  }

  public static searchChannel = async (name): Promise<HelixChannelSearchResult> => {
    return await from((await Twitch.client.search.searchChannels(name)).data)
      .pipe(
        filter((channel) => channel.name === name),
        take(1)
      )
      .toPromise()
  }

  public static getStream = async (userId): Promise<HelixStream> => {
    return await Twitch.client.streams.getStreamByUserId(userId)
  }

}
