import { Twitch } from '../hooks/twitch'
import { filterParameters, Message } from './utils'

export class Moderators extends Message {
  public constructor(client) {
    super(client)
    this.init()
  }

  private shoutout = async (channel, tags, message, self) => {
    if (!this.mod(tags)) return

    let parameters = filterParameters(message)
    if (/^!so [\@\w]\w*/i.test(message) || /^!search [\@\w]\w*/i.test(message)) {
      if (parameters.length == 0) {
        this.client.say(channel, `/me You didn't specify a user to look up for... You piece of shit...`)
        return
      }

      let result = await Twitch.searchChannel(parameters[0].replace('@', '').toLowerCase())
      if (result) {
        let stream = await Twitch.getStream(result.id)
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

  private mod(tags) {
    return tags.mod || /eltharynd/i.test(tags.username) || /elthabot/i.test(tags.username) || (tags.badges && tags.badges.broadcaster)
  }
}
