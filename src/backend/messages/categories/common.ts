import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage'
import axios from 'axios'
import { Chat } from '../../twitch/chat'
import { filterParameters, Message } from '../message'

export class Common extends Message {
  public constructor(iClient) {
    super(iClient)
    this._init()
  }

  static commands = [
    { command: `<any mention of ccarbn>`, description: `cCarbn answers the greeting`},
    { command: `F`, description: `cCarbn Fs too`},
    { command: `^`, description: `cCarbn ^ too`},
    { command: `!hug <user>`, description: `Hugs the user`},
    { command: `!tuck <user>`, description: `Tucks the user`},
    { command: `!time <timezone or abbreviation>`, description: `Returns the time in that specific timezone (Europe/Bern, CET, EST, PST)`}
  ]

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
      if (this._timeout(20 * 60)) return
      this.client.say(channel, `/me F`)
    }
  }

  private hug = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!hug [\@a-zA-Z0-9][a-zA-Z0-9]*/i.test(message)) {
      this.client.say(channel, `/me @${user} hugs @${filterParameters(message)[0].replace('@', '')} with love!`)
    }
  }

  private tuck = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!tuck [\@a-zA-Z0-9][a-zA-Z0-9]*/i.test(message)) {
      this.client.say(channel, `/me @${user} tucks @${filterParameters(message)[0].replace('@', '')} snuggly in their bed!`)
    }
  }

  private caret = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^\^$/.test(message)) {
      if (this._timeout(20 * 60)) return
      this.client.say(channel, `/me ^^`)
    }
  }

  private time = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!time [\w\/]+/i.test(message)) {
      let par = message.replace(/^!time /i, '')
      if(/pst/i.test(par) || /pt/i.test(par) || /pdt/i.test(par))
        par = 'America/Los_Angeles'
      let data: any
      try {
        data = (await axios.get(`http://worldtimeapi.org/api/timezone/${encodeURI(par).replace(/\//g, '%2F')}`)).data
      } catch (e) {
        this.client.say(channel, `/me I could not find that location...`)
        return
      }
      if (data && data.abbreviation) {
        this.client.say(channel, `/me Time in ${data.abbreviation} is ${data.datetime.slice(11, 16)}`)
        return
      } else if (data && data.length && data.length > 0) {
        this.client.say(channel, `/me I've found multiple results... try one of the following: ${data[0]}, ${data[1]}, ${data[2]}, ...`)
        return
      }
    }
  }

}
