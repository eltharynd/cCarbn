import { ApiClient, HelixChannelSearchFilter, HelixChannelSearchResult, HelixStream } from '@twurple/api'
import { DirectConnectionAdapter, EventSubListener } from '@twurple/eventsub'
import { RefreshingAuthProvider, ClientCredentialsAuthProvider } from '@twurple/auth'
import { from } from 'rxjs'
import * as fs from 'fs'
import { filter, take } from 'rxjs/operators'

import { CREDENTIALS } from '../index'

export const ENDPOINT = JSON.parse('' + fs.readFileSync('endpoint_credentials.json'))
export class Twitch {
  private static authProvider
  static client: ApiClient
  static listener: EventSubListener
  static channelID: string

  public static async init() {
    Twitch.authProvider = new ClientCredentialsAuthProvider(CREDENTIALS.clientId, CREDENTIALS.clientSecret)
    Twitch.client = new ApiClient({
      authProvider: Twitch.authProvider,
    })
    let channel = await Twitch.client.users.getUserByName(CREDENTIALS.channel)
    Twitch.channelID = channel ? channel.id : null

    if (!Twitch.channelID)
      console.error(`Could not find channel ID for channel: '${CREDENTIALS.channel}'. Please check your spelling and runf 'npm run setup' again if necessary...`)

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
    await Twitch.listener.listen(3001)

    Twitch.listener.subscribeToChannelHypeTrainBeginEvents(Twitch.channelID, (event) => {
      console.log('subscribeToChannelHypeTrainBeginEvents')
      console.log(event)
    })
    Twitch.listener.subscribeToChannelCheerEvents(Twitch.channelID, (event) => {
      console.log('subscribeToChannelCheerEvents')
      console.log(event)
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

  private static subscribe = async (): Promise<any> => {}
}
