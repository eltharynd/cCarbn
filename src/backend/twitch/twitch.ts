import { ApiClient, HelixChannelSearchResult, HelixStream } from '@twurple/api'
import { DirectConnectionAdapter, EventSubListener } from '@twurple/eventsub'
import { from } from 'rxjs'
import * as fs from 'fs'
import { filter, take } from 'rxjs/operators'

import { clientProvider, CREDENTIALS } from '../index'
import { ENDPOINT } from '../index'

export class Twitch {
  static client: ApiClient
  static listener: EventSubListener

  public static async init() {
    Twitch.client = new ApiClient({
      authProvider: clientProvider,
    })
    
    Twitch.listener = new EventSubListener({
      apiClient: Twitch.client,
      adapter: new DirectConnectionAdapter({
        hostName: ENDPOINT.hostname,
        sslCert: {
          cert: `${fs.readFileSync(ENDPOINT.crt)}`,
          key: `${fs.readFileSync(ENDPOINT.key)}`,
        },
      }),
      secret: `${CREDENTIALS.channel}${Date.now()}`,
    })
    //await Twitch.listener.listen(3001)

    /*  
    Twitch.listener.subscribeToChannelHypeTrainBeginEvents(Twitch.channelID, (event) => {
      console.log('subscribeToChannelHypeTrainBeginEvents')
      console.log(event)
    })
    Twitch.listener.subscribeToChannelCheerEvents(Twitch.channelID, (event) => {
      console.log('subscribeToChannelCheerEvents')
      console.log(event)
    }) 
    */
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
