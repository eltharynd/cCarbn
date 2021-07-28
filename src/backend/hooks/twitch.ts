import { ApiClient } from '@twurple/api'
import { ClientCredentialsAuthProvider } from '@twurple/auth'
import { from } from 'rxjs'
import { filter, take } from 'rxjs/operators'

import { CREDENTIALS } from '../index'

export class Twitch {
  private static authProvider
  static client: ApiClient
  static channelID: number

  public static async init() {
    Twitch.authProvider = new ClientCredentialsAuthProvider(CREDENTIALS.clientID, CREDENTIALS.secret)
    Twitch.client = new ApiClient({
      authProvider: this.authProvider,
    })

    let channel = await this.searchChannel(CREDENTIALS.channel)
    Twitch.channelID = channel ? channel.id : null

    if (!Twitch.channelID)
      console.error(`Could not find channel ID for channel: '${CREDENTIALS.channel}'. Please check your spelling and runf 'npm run setup' again if necessary...`)
  }

  public static searchChannel = async (name): Promise<any> => {
    return await from((await Twitch.client.search.searchChannels(name)).data)
      .pipe(
        filter((channel) => channel.name === name),
        take(1)
      )
      .toPromise()
  }

  public static getStream = async (userId): Promise<any> => {
    return await Twitch.client.streams.getStreamByUserId(userId)
  }
}
