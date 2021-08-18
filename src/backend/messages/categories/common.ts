import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage'
import axios from 'axios'
import { Chat } from '../../twitch/chat'
import { filterParameters, Message } from '../message'

export class Common extends Message {
  public constructor(iClient) {
    super(iClient)
    this.init()
  }

  private hug = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!hug [\@a-zA-Z0-9][a-zA-Z0-9]*/i.test(message)) {
      this.client.say(channel, `/me @${user} hugs @${filterParameters(message)[0].replace('@', '')} then lowkey licks their cheek!`)
    }
  }

  private tuck = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!tuck [\@a-zA-Z0-9][a-zA-Z0-9]*/i.test(message)) {
      this.client.say(channel, `/me @${user} tucks @${filterParameters(message)[0].replace('@', '')} in their bed! Good Night you PogChamp!`)
    }
  }

  private greetings = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/@cCarbn/i.test(message) && (/hi/i.test(message) || /hello/i.test(message) || /what's up/i.test(message) || /o\//i.test(message))) {
      let options = [
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

        `@${user} this is ACTUALLY funny cause my server just got a 1 on a Math.random which is pretty fucking incredible if you ask me... I didn't even think this was ever gonna happen ngl...`,
      ]
      this.client.say(channel, options[Math.floor(Math.random() * options.length)])
    }
  }

  private simp = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/ simp /i.test(message) || / simp[\?\!]/.test(message) || / simp$/.test(message) || / simping /.test(message) || / simping$/.test(message)) {
      if (this.timeout(10)) return
      this.client.say(channel, `/me @${user} We don't use that language over here...`)
    }
  }

  private F = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^F$/.test(message)) {
      if (this.timeout(20 * 60)) return
      this.client.say(channel, `/me F`)
    }
  }

  private quote = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^F$/.test(message)) {
      if (this.timeout(20 * 60)) return
      this.client.say(channel, `/me ^^`)
    }
  }

  private cats = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/!cat/i.test(message)) {
      if (this.timeout(5)) return
      let facts = (await axios.get(`https://cat-fact.herokuapp.com/facts`)).data
      if (facts && facts.length > 0) 
        this.client.say(channel, `/me ${facts[Math.floor(Math.random() * facts.length)].text}`)
      else 
        this.client.say(channel, `/me I'm trying to get some cool cat facts but this dudes aren't answering... I suppose that's what you get with free APIs`)
    }
  }

  private dogs = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/!dog/i.test(message)) {
      if (this.timeout(5)) return
      let facts = (await axios.get(`https://dog-facts-api.herokuapp.com/api/v1/resources/dogs/all`)).data
      if (facts && facts.length > 0) this.client.say(channel, `/me ${facts[Math.floor(Math.random() * facts.length)].fact}`)
      else this.client.say(channel, `/me I'm trying to get some cool dog facts but this dudes aren't answering... I suppose that's what you get with free APIs`)
    }
  }
}
