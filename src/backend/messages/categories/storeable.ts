import { HelixChannel } from '@twurple/api/lib'
import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage'
import { from } from 'rxjs'
import { filter, map, take, toArray } from 'rxjs/operators'
import { Command } from '../../db/models/command'
import { Mongo } from '../../db/mongo'
import { Twitch } from '../../twitch/twitch'
import { MAX_CHAT_MESSAGE_LENGTH, Message } from '../message'

const RGX_TARGET = /\@\w+(\s|$)/gi
const RGX_EVAL = /\$eval\(.+\)(\s|$)/gi
const RGX_RAND = /\$((rand)|(rnd))\d+/gi

const FORMAT_ERROR = 'This command is formatted wrong... Please check your spelling or consult the documentation...'

export class Storeable extends Message {
  commands = []

  public constructor(client) {
    super(client)
    this._fetch()
    this._init()
  }

  private _fetch = async (): Promise<any> => {
    let buffer: any = await Command.find({userId: this.iClient.userId})
    for (let c of buffer) {
      let command = c.toJSON()
      command.listener = this.client.onMessage(await this._generateListener(command))
      this.commands.push(command)
    }
  }

  private command = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!((command)|(commands)|(cmd)|(cmds)) ((add .+)|(edit .+)|(delete .+)|(show .+)|(source .+)|(args .+)|(list))$/i.test(message)) {
      if (!msg.userInfo.isMod && !msg.userInfo.isBroadcaster) {
        this.client.say(channel, `/me Only mods can edit commands...`)
        return
      }

      let buffer = message.replace(/^!command /i, '').replace(/^!commands /i, '').replace(/^!cmd /i, '').replace(/^!cmds /i, '')
      if (buffer.startsWith('add') || buffer.startsWith('edit')) {
        let edit = buffer.startsWith('edit') ? true : false
        buffer = buffer.replace('add ', '').replace('save ', '').replace('edit ', '')

        let name: RegExpMatchArray|string = buffer.match(/^\!*\w+ /i)
        if (!name) {
          this.client.say(channel, `/me ${FORMAT_ERROR}`)
          return
        }

        name = name[0].replace(' ', '')
        buffer = buffer.replace(/^\!*\w+ /i, '')

        let exists: any = await Command.findOne({userId: Mongo.ObjectId(this.iClient.userId), command: name})
        if (!edit && exists) {
          this.client.say(
            channel,
            `/me This command already exists... If you want to modify it please use '!cmd edit' instead, if you're not sure what the command is atm you can always use '!cmd source'`
          )
          return
        }

        let cooldown: any = buffer.match(/\-\-cd\=\d+/gi)
        if(cooldown?.length>0) {
          cooldown = parseInt(cooldown[0].replace('--cd=', ''))
          buffer = buffer.replace(/\-\-cd\=\d+\s*/gi, '')
        } else cooldown = 0

        let cooldownPerUser: any = /\-\-cdpu/gi.test(buffer)
        if(cooldownPerUser) buffer = buffer.replace(/\-\-cdpu\s*/gi, '')

        let modsOnly: any = /\-\-modsonly/gi.test(buffer)
        if(modsOnly) buffer = buffer.replace(/\-\-mods\s*/gi, '')

        let streamerOnly: any = /\-\-streamer/gi.test(buffer)
        if(streamerOnly) buffer = buffer.replace(/\-\-streamer\s*/gi, '')


        let targets = buffer.match(new RegExp(RGX_TARGET))
        let ev = buffer.match(new RegExp(RGX_EVAL))
        let rand = buffer.match(new RegExp(RGX_RAND))

        let index = 0
        let args = []
        if(targets)
          for(let i of targets) {
            if(!/\@user\s*/i.test(i)) {
              args.push(i.replace(' ', ''))
              buffer = buffer.replace(i, `{{${index++}}} `)
            }
          }

        if(ev)
          for(let i of ev) {
            args.push(i.replace(/\s$/, ''))
            buffer = buffer.replace(i, `{{${index++}}} `)
          }

        if(rand) 
          for(let i of rand)
            buffer = buffer.replace(i, i.replace('rand', 'rnd'))

        if (exists) {
          exists.command = name
          exists.answer = buffer
          exists.args = args
          exists.source = message
          exists.cooldown = cooldown
          exists.cooldownPerUser = cooldownPerUser,
          exists.mods = modsOnly
          exists.streamer = streamerOnly
          await exists.save()
          let found = await from(this.commands).pipe(
            filter(c => c.command === exists.command),
            take(1)
          ).toPromise()
          if(found) {
            if(found.listener) 
              found.listener.unbind()
            this.commands.splice(this.commands.indexOf(found, 1))
          }
          
        } else {
          exists = new Command({
            userId: Mongo.ObjectId(this.iClient.userId),
            command: name,
            answer: buffer,
            args: args,
            source: message,
            cooldown: cooldown,
            cooldownPerUser: cooldownPerUser,
            mods: modsOnly,
            streamer: streamerOnly
          })
          await exists.save()
        }


        let result = exists.toJSON()
        this.commands.push(result)
        let listener = this._generateListener(exists)
        result.listener = this.client.onMessage(listener)

        this.client.say(channel, `/me Successfully ${edit ? 'edited' : 'added new'} command...`)
      } else if(buffer.startsWith('delete')) {
        buffer = buffer.replace('delete ', '')

        let name: RegExpMatchArray | string = buffer.match(/^\!*\w+(\s|$)/i)
        if (!name) {
          this.client.say(channel, `/me ${FORMAT_ERROR}`)
          return
        }
        name = name[0].replace(' ', '')

        let exists = await Command.findOne({userId: this.iClient.userId, command: name})
        if (!exists) {
          this.client.say(channel, `/me This command doesn't exist...`)
          return
        }

        let command = await from(this.commands)
          .pipe(
            filter((c) => c.command === name),
            take(1)
          )
          .toPromise()
          
        if(command.listener) command.listener.unbind()

        await Command.deleteOne({userId: this.iClient.userId, command: name})
        this.commands.splice(this.commands.indexOf(command), 1)
        this.client.say(channel, `/me Successfully deleted command...`)
      } else if(buffer.startsWith('show')) {
        buffer = buffer.replace('show ', '')
        let found: any = await Command.findOne({userId: this.iClient.userId, command: buffer})
        if (found) this.client.say(channel, `/me Here's the answer for command "${buffer}": ${found.answer}`)
        else this.client.say(channel, `/me I couldn't find such command...`)
      } else if(buffer.startsWith('source')) {
        buffer = buffer.replace('source ', '')
        let found: any = await Command.findOne({userId: this.iClient.userId, command: buffer})
        if (found) this.client.say(channel, `/me Here's the source for command "${buffer}": ${found.source.replace(/^!((command)|(commands)|(cmd)|(cmd)) ((add)|(edit))/i, '!cmd add')}`)
        else this.client.say(channel, `/me I couldn't find such command...`)
      } else if(buffer.startsWith('args')) {
        buffer = buffer.replace('args ', '')
        let found: any = await Command.findOne({userId: this.iClient.userId, command: buffer})
        if(found?.args?.length>0) this.client.say(channel, `/me "${buffer}" takes the following arguments: ${found.args.join(', ')}`)
        else if(found) this.client.say(channel, `/me "${buffer}" doesn't take any argument...`)
        else this.client.say(channel, `/me I couldn't find such command...`)
      } else if(buffer.startsWith('list')) {
        let printables = await from(this.commands)
        .pipe(
          map((v, i) => {
            return v.command
          }),
          toArray()
        )
        .toPromise()

        if(!printables || printables.length < 1) this.client.say(channel, `/me No commands saved yet...`)
        else {
          let buffer = `/me There's the current commands: '${printables.join(`', '`)}'.`
          if(buffer.length <= MAX_CHAT_MESSAGE_LENGTH) {
            this.client.say(channel, buffer)
          } else {
            let strings: string[] = [`/me There's the current commands: `]
            
            for(let i=0; i<printables.length; i++) {
              if(strings[strings.length-1].length + printables[i].length + 3 > MAX_CHAT_MESSAGE_LENGTH) {
                strings.push(`'${printables[i]}'`)
              } else {
                strings[strings.length-1] = strings[strings.length-1] + ` '${printables[i]}'` 
              }
            }
            
            for(let i=0; i<strings.length; i++) {
              setTimeout(() => {
                this.client.say(channel, strings[i])
              }, 500 * (i+1));
            }
          }
          
        }
      }
    }
  }

  private _generateListener = (command) => {
    return async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
      let tester = command.command
      if (new RegExp('^' + tester, 'i').test(message)) {

        if (command.cooldown && this._timeout(command.cooldown, `${tester}${command.cooldownPerUser ? user : ''}`)) return

        if(command.streamer && !msg.userInfo.isBroadcaster) 
          return this.client.say(channel, `/me This command is for the streamer only...`)
        if(command.mods && !msg.userInfo.isBroadcaster && !msg.userInfo.isMod) 
          return this.client.say(channel, `/me This command is for mods only...`)

        let answer = command.answer
        
        let buffer = message.replace(`${command.command} `, '').replace(`${command.command}`, '')
        let inputs: string[] = buffer.length>0 ? buffer.split(' ') : []
        let shift = () => {
          if (inputs.length < 1) throw new Error()
          return inputs.shift()
        }

        try {
          for (let i = 0; i < command.args.length; i++) {
            let arg = command.args[i]

            if (new RegExp(RGX_TARGET).test(arg)) {
              if(/\@streamer\s*/gi.test(arg)) {
                try {
                  let streamer = shift().replace(/\@/gi, '').replace(/\s+/gi, '').toLowerCase()
                  let channel: any = (await Twitch.client.search.searchChannels(streamer)).data
                  channel = await from(channel).pipe(
                    filter((channel: any) => channel.name === streamer),
                    take(1)
                  ).toPromise()
                  let stream = await Twitch.client.streams.getStreamByUserId(channel.id)
                  let lastGame
                  let status = 'Offline'
                  if(stream?.gameName) {
                    lastGame = stream.gameName
                    status = 'Online'
                  } else if(channel.gameName)
                    lastGame = channel.gameName
                  else
                    lastGame = "'Never streamed before'"

                  answer = answer.replace(`{{${i}}}`, '')
                  answer = answer.replace(/\$streamer/, channel.name)
                  answer = answer.replace(/\$streamer_id/, channel.displayName)
                  answer = answer.replace(/\$last_game/, lastGame)
                  answer = answer.replace(/\$status/, status)
                } catch (err) {
                  this.client.say(channel, '/me I couldn\'t find that streamer...')
                  return
                } 
              } else 
                answer = answer.replace(`{{${i}}}`, shift())
            } else if (new RegExp(RGX_EVAL).test(arg)) {
              answer = answer.replace(`{{${i}}}`, `${eval(arg.replace(/^\$eval\(/, '').replace(/\)$/, ''))}`)
            }
          }

          if(/\$timeout/i.test(answer)) {
            answer = answer.replace(`$timeout`, '')
            this.client.timeout(channel, user, this.settings?.storeable?.timeout|1).catch(e => {})
          } 

          if(answer?.length>0) {

            let random = answer.match(new RegExp(RGX_RAND))
            if(random?.length>0) {
              for(let r of random) {
                let num = parseInt(r.replace(`$rnd`, ''))
                answer = answer.replace(r, `${Math.floor(Math.random() * ++num)}`)
              }
            }

            if(/\@user/gi.test(answer)) answer = answer.replace(/\@user/gi, `@${msg.userInfo.displayName}`)
            if(/\@streamer/gi.test(answer)) {


              answer.replace(/\@streamer/gi, `@${msg.userInfo.displayName}`)
            }

            this.client.say(channel, `/me ${answer}`)
          }
        } catch (e) {
          this.client.say(channel, `/me This command requires more arguments...`)
        }
      }
    }
  }

  confirmation = false
  private flush = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!((command)|(commands)|(cmd)|(cmds)) flush$/i.test(message)) {
      if (!msg.userInfo.isBroadcaster) this.client.say(channel, `/me Only the streamer can flush all commands from db... `)
      else if (this.confirmation) {
        await Command.deleteMany({userId: this.iClient.userId})
        for (let c of this.commands) 
          if (c.listener) c.listener.unbind()
        this.commands = []
        this.client.say(channel, `/me Oooohkay boss... deleted everything... I hope you know what you're doing...`)
        this.confirmation = false
      } else {
        this.client.say(
          channel,
          `/me This command will delete EVERY command you ever saved... They are NOT recoverable... If you're sure about this enter the same command again within 10 seconds...`
        )
        this.confirmation = true
        setTimeout(() => {
          this.confirmation = false
        }, 10000)
      }
    }
  }
}


/* private justice = (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
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
} */