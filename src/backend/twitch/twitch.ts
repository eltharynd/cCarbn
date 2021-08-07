import { ApiClient, HelixChannelSearchResult, HelixStream, HelixUser } from '@twurple/api'
import { DirectConnectionAdapter, EventSubListener } from '@twurple/eventsub'
import { from } from 'rxjs'
import * as fs from 'fs'
import { filter, take } from 'rxjs/operators'

import { clientProvider, CREDENTIALS, ENDPOINT, userProvider } from '../index'
import { HypeTrain } from '../socket/events/hypetrain'
import { Cheers } from '../socket/events/cheers'
import { TokenInfo } from '@twurple/auth/lib'

export class Twitch {

  public userId

  client: ApiClient
  listener: EventSubListener

  static channelID: HelixUser

  private static subscriptions = []
  
  public async init() {

    this.client = new ApiClient({
      authProvider: userProvider,
    })

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

  public searchChannel = async (name): Promise<HelixChannelSearchResult> => {
    return await from((await this.client.search.searchChannels(name)).data)
      .pipe(
        filter((channel) => channel.name === name),
        take(1)
      )
      .toPromise()
  }

  public getStream = async (userId): Promise<HelixStream> => {
    return await this.client.streams.getStreamByUserId(userId)
  }

}
