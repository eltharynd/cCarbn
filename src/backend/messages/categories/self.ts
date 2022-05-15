import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage'
import axios from 'axios'
import { Chat } from '../../twitch/chat'
import { filterParameters, Message } from '../message'

export class Self extends Message {
  public constructor(iClient) {
    super(iClient)
    this._init()
  }

  private greetings = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/cCarbn/i.test(message) && (/hi/i.test(message) || /hey/i.test(message) || /hello/i.test(message) || /what's up/i.test(message) || /o\//i.test(message))) {
      let custom = [
        `@${user} What's up bud? Nice to see you, hope you're doing fine...`,
        `@${user} Hey!!`,
        `@${user} Heya bud`,
        `@${user} Sup dude`,
        `@${user} Hello my friend`,
        `@${user} Nice to see you o/`,
        `@${user} hey it's been a while, how's things?`,
        `Oh look, it's @${user} again... great`,
        `@${user} sup? here to chill a bit as well?`,
        `I was just thinking about you @${user}!!! D: D: D:`,
      ]
      let options = [
        `@${user} this is ACTUALLY funny cause my server just got a clean 0 on a Math.rand which is pretty fucking incredible if you ask me... I didn't even think this was ever gonna happen ngl...`,

        ...custom,
        ...custom,
        ...custom,
        ...custom,
        ...custom,
        ...custom,
        ...custom,
        ...custom,
        ...custom,
        ...custom,

        `@${user} this is ACTUALLY funny cause my server just got a clean 1 on a Math.random which is pretty fucking incredible if you ask me... I didn't even think this was ever gonna happen ngl...`,
      ]
      this.client.say(channel, '/me ' + options[Math.floor(Math.random() * options.length)])
    }
  }

  private F = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^F$/i.test(message)) {
      if (user !== channel.replace('#', '') && this._timeout(20 * 60)) return
      this.client.say(channel, `/me F`)
    }
  }

  private caret = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^\^$/.test(message)) {
      if (user !== channel.replace('#', '') && this._timeout(20 * 60)) return
      this.client.say(channel, `/me ^^`)
    }
  }
}
