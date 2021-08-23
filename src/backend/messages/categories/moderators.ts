import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage'
import { Chat } from '../../twitch/chat'
import { Twitch } from '../../twitch/twitch'
import { filterParameters, Message } from '../message'

export class Moderators extends Message {

  twitch
  public constructor(iClient) {
    super(iClient)
    this._init()
    this._initApi()
  }

  private async _initApi() {
    this.twitch = await Twitch.findByUserId(this.iClient.userId.toString())
  }

  private shoutout = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    
    if (!msg.userInfo.isMod && !msg.userInfo.isBroadcaster) return

    let parameters = filterParameters(message)
    if (/^!so [\@\w]\w*/i.test(message) || /^!search [\@\w]\w*/i.test(message)) {
      if (parameters.length == 0) {
        this.client.say(channel, `/me You didn't specify a user to look up for... You piece of shit...`)
        return
      }

      let result = await this.twitch.searchChannel(parameters[0].replace('@', '').toLowerCase())
      if (result) {
        let stream = await this.twitch.getStream(result.id)
        this.client.say(
          channel,
          `/me ${
            /^!search/i.test(message)
              ? `I think you meant to look for this channel: twitch.tv/${result.name} .`
              : `If you're not following ${result.name} i honestly have no fucking clue what you're doing with your useless life. Go follow on: twitch.tv/${result.name} . You won't regret it they're a goddamn legend.`
          } ${
            stream
              ? `They're currently online playing '${result.gameName}' . D:`
              : result.gameName
              ? `They're offline now but were last seen playing ${result.gameName}.`
              : `They've actually never streamed before so.. there's that...`
          }`.replace('\n', '')
        )
      } else this.client.say(channel, `/me I'm sorry i could not find any such channel...`)
    }
  }

}
