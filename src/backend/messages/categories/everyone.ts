import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage'
import axios from 'axios'
import { Chat } from '../../twitch/chat'
import { filterParameters, Message } from '../message'

export class Everyone extends Message {
  public constructor(iClient) {
    super(iClient)
    this._init()
  }

  //TODO refactor into it's own thing
  voters = {}
  birds = {}
  private voting = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!vote \w+$/.test(message)) {
      let bird = (await filterParameters(message))[0].toLowerCase()
      let who = user.toLowerCase()

      if (this.voters[who]) {
        this.birds[bird] = Math.max(0, (this.birds[bird] ? +this.birds[bird] : 0) + 1)
        this.birds[this.voters[who]] = Math.max(0, (this.birds[this.voters[who]] ? +this.birds[this.voters[who]] : 0) - 1)
        this.client.say(channel, `/me ${msg.userInfo.displayName} changed his previous vote to frick '${this.voters[who]}', he now wants to frick '${bird}' instead`)
        this.voters[who] = bird
      } else {
        this.birds[bird] = (this.birds[bird] ? +this.birds[bird] : 0) + 1
        this.voters[who] = bird
        this.client.say(channel, `/me ${msg.userInfo.displayName} voted to frick '${bird}'.`)
      }

      let winner
      let tier
      let votes = 0
      let total = 0
      for (let key of Object.keys(this.birds)) {
        let item = this.birds[key]
        total += this.birds[key]

        if (item > votes) {
          winner = key
          tier = null
          votes = item
        } else if (item === votes) {
          tier = key
        }
      }

      if (tier) {
        setTimeout(() => {
          this.client.say(
            channel,
            `/me '${winner}' and '${tier}' are currently tied on top to be fricked next. They've got a total of ${votes} votes winning with a ${
              (Math.floor((votes / total) * 100) / 100) * 100
            }%. What should we do if they end up tied? frick em both?`
          )
        }, 1000)
      } else {
        setTimeout(() => {
          this.client.say(
            channel,
            `/me '${winner}' is currently on top to be fricked next. It's got a total of ${votes} votes winning with a ${(Math.floor((votes / total) * 100) / 100) * 100}%.`
          )
        }, 1000)
      }
    } else if (/^!votereset$/.test(message) && (msg.userInfo.isMod || msg.userInfo.isBroadcaster)) {
      this.client.say(channel, `/me votes have been reset.`)
      this.voters = {}
      this.birds = {}
    } else if (/^!votestatus$/.test(message)) {
      if (Object.keys(this.voters).length < 1) {
        this.client.say(channel, `/me there are currently no votes.... prick!`)
        return
      }
      let winner
      let tier
      let votes = 0
      let total = 0
      for (let key of Object.keys(this.birds)) {
        let item = this.birds[key]
        total += this.birds[key]

        if (item > votes) {
          winner = key
          tier = null
          votes = item
        } else if (item === votes) {
          tier = key
        }
      }

      if (tier) {
        this.client.say(
          channel,
          `/me '${winner}' and '${tier}' are currently tied on top to be fricked next. They've got a total of ${votes} votes winning with a ${
            (Math.floor((votes / total) * 100) / 100) * 100
          }%. What should we do if they end up tied? frick em both?`
        )
      } else {
        this.client.say(
          channel,
          `/me '${winner}' is currently on top to be fricked next. It's got a total of ${votes} votes winning with a ${(Math.floor((votes / total) * 100) / 100) * 100}%.`
        )
      }
    } else if (/^!votelist/i.test(message)) {
      if (Object.keys(this.voters).length < 1) {
        this.client.say(channel, `/me there are currently no votes.... prick!`)
        return
      }

      let string
      for (let key of Object.keys(this.birds)) {
        if (string) string += ', '
        else string = ''
        string += `${key}: ${this.birds[key]}`
      }
      this.client.say(channel, `/me Here's the current casts: ${string}`)
    } else if (/^!vote/i.test(message)) {
      this.client.say(channel, `/me You can cast your votes by typing '!vote YOUR_VOTE' or check status with '!votestatus'`)
    }
  }

  private justice = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/!justice/.test(message)) {
      if (this._timeout(20)) return
      this.client.say(channel, `I have brought peace, freedom, justice, and security to my new empire.`)
      setTimeout(() => {
        this.client.say(channel, `Your new empire?`)
        setTimeout(() => {
          this.client.say(channel, `Don't make me kill you.`)
          setTimeout(() => {
            this.client.say(channel, `Anakin, my allegiance is to the Republic, to Democracy!`)
            setTimeout(() => {
              this.client.say(channel, `If you are not with me, then you are my enemy.`)
              setTimeout(() => {
                this.client.say(channel, `Only a Sith deals in absolutes. I will do what I must.`)
                setTimeout(() => {
                  this.client.say(channel, `You will try.`)
                }, 3500)
              }, 2500)
            }, 2500)
          }, 2500)
        }, 1500)
      }, 7000)
    }
  }

  private eightBall = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/!8ball/i.test(message)) {
      let samples = [
        'As I see it, yes.',
        'Ask again later.',
        'Better not tell you now.',
        'Cannot predict now.',
        'Concentrate and ask again.',
        "Don't count on it.",
        'It is certain.',
        'It is decidedly so.',
        'Most likely.',
        'My reply is no.',
        'My sources say no.',
        'Outlook not so good.',
        'Outlook good.',
        'Reply hazy, try again.',
        'Signs point to yes.',
        'Very doubtful.',
        'Without a doubt.',
        'Yes.',
        'Yes - definitely.',
        'You may rely on it.',
      ]
      this.client.say(channel, `/me @${msg.userInfo.displayName} ${samples[Math.floor(Math.random() * samples.length)]}`)
    }
  }

  private dadjokes = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!hitusup/i.test(message)) {
      if (this._timeout(5)) return
      let facts = (
        await axios.get(`https://icanhazdadjoke.com/`, {
          headers: {
            Accept: 'application/json',
          },
        })
      ).data
      if (facts) this.client.say(channel, `/me ${facts.joke}`)
      else this.client.say(channel, `/me I'm trying to get some cool dad jokes but this dudes aren't answering... I suppose that's what you get with free APIs`)
    }
  }

  private darkjokes = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!dark/i.test(message)) {
      if (this._timeout(5)) return
      let result = (
        await axios.get(`https://v2.jokeapi.dev/joke/Dark` + '?blacklistFlags=religious,political,racist,sexist', {
          headers: {
            Accept: 'application/json',
          },
        })
      ).data
      if (result && result.joke) {
        this.client.say(channel, `/me ${result.joke}`)
      } else if (result && result.setup) {
        this.client.say(channel, `/me ${result.setup}`)
        setTimeout(() => {
          this.client.say(channel, `/me ${result.delivery}`)
        }, 5000)
      } else this.client.say(channel, `/me I'm trying to get some cool dark jokes but this dudes aren't answering... I suppose that's what you get with free APIs`)
    }
  }

}
