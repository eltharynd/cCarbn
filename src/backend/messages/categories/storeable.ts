import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage'
import { from } from 'rxjs'
import { filter, map, take, toArray } from 'rxjs/operators'
import { Command } from '../../db/models/command'
import { Mongo } from '../../db/mongo'
import { Chat } from '../../twitch/chat'
import { Message } from '../message'

const RGX_USER = /\@\w+(\s|$)/gi
//@user replaces with user sending the message
const RGX_EVAL = /\$eval\(.+\)(\s|$)/gi
const RGX_RAND = /\$((rand)|(rnd))\d+/gi

const FORMAT_ERROR = 'This command is formatted wrong... Please check your spelling or consult the documentation...'

export class Storeable extends Message {
  commands = []

  public constructor(client) {
    super(client)
    this.fetch()
    this.init()
  }

  private fetch = async (): Promise<any> => {
    let buffer: any = await Command.find({userId: this.iClient.userId})
    for (let c of buffer) {
      let command = c.toJSON()
      command.listener = this.client.onMessage(await this.generateListener(command))
      this.commands.push(command)
    }
  }

  //TODO implement mods only commands
  private command = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!((command)|(cmd)) ((add)|(save)|(edit)|(delete)|(show)|(answer)|(source)) .+$/i.test(message)) {
      if (!msg.userInfo.isMod && !msg.userInfo.isBroadcaster) {
        this.client.say(channel, `/me Only mods can edit commands...`)
        return
      }

      let buffer = message.replace(/^!command /i, '').replace(/^!cmd /i, '')
      if (buffer.startsWith('add') || buffer.startsWith('save') || buffer.startsWith('edit')) {
        let edit = buffer.startsWith('edit') ? true : false
        buffer = buffer.replace('add ', '').replace('save ', '').replace('edit ', '')

        let name: RegExpMatchArray | string = buffer.match(/^\!*\w+ /i)
        if (!name) {
          this.client.say(channel, `/me ${FORMAT_ERROR}`)
          return
        }

        name = name[0].replace(' ', '')
        buffer = buffer.replace(/^\!*\w+ /i, '')

        let exists: any = await Command.findOne({userId: this.iClient.userId, command: name})
        if (!edit && exists) {
          this.client.say(
            channel,
            `/me This command already exists... If you want to modify it please use '!cmd edit' instead, if you're not sure what the command is atm you can always use '!cmd source'`
          )
          return
        }

        let targets = buffer.match(new RegExp(RGX_USER))
        let ev = buffer.match(new RegExp(RGX_EVAL))
        let rand = buffer.match(new RegExp(RGX_RAND))

        let index = 0
        let parameters = []
        if (targets)
          for (let i of targets) {
            parameters.push(i.replace(' ', ''))
            buffer = buffer.replace(i, `{{${index++}}} `)
          }

        if (ev)
          for (let i of ev) {
            parameters.push(i.replace(/\s$/, ''))
            buffer = buffer.replace(i, `{{${index++}}} `)
          }

        if (rand)
          for (let i of rand) {
            parameters.push(i.replace('rand', 'rnd'))
            buffer = buffer.replace(i, `{{${index++}}}`)
          }

        if (exists) {
          exists.command = name
          exists.answer = buffer
          exists.params = parameters
          exists.source = message
          exists.mods = null
          await exists.save()
        } else {
          exists = new Command({
            userId: this.iClient.userId,
            command: name,
            answer: buffer,
            params: parameters,
            source: message,
            mods: null
          })
          await exists.save()
        }

        let result = exists.toJSON()
        this.commands.push(result)
        let listener = this.generateListener(exists)
        result.listener = this.client.onMessage(listener)

        this.client.say(channel, `/me Successfully ${exists ? 'edited' : 'added new'} command...`)
      } else if (buffer.startsWith('delete')) {
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
        command.listener.unbind()
        await Command.deleteOne({userId: this.iClient.userId, command: name})
        this.commands.splice(this.commands.indexOf(command), 1)
        this.client.say(channel, `/me Successfully deleted command...`)
      } else if (buffer.startsWith('show')) {
        buffer = buffer.replace('show ', '').replace('answer ', '')
        let found: any = await Command.findOne({userId: this.iClient.userId, command: buffer})
        if (found) this.client.say(channel, `/me Here's the answer for command "${buffer}": \`${found.answer}\``)
        else this.client.say(channel, `/me I couldn't find such command...`)
      } else if (buffer.startsWith('source')) {
        buffer = buffer.replace('source ', '')
        let found: any = await Command.findOne({userId: this.iClient.userId, command: buffer})
        if (found) this.client.say(channel, `/me Here's the source for command "${buffer}": \`${found.source}\``)
        else this.client.say(channel, `/me I couldn't find such command...`)
      }
    } else if (/!commands/.test(message)) {
      //PRINT THE LIST OF ALL SAVED COMMANDS
      let printables = await from(this.commands)
        .pipe(
          map((v, i) => {
            return v.command
          }),
          toArray()
        )
        .toPromise()

      //TODO check if message length > 500
      if (!printables || printables.length < 1) this.client.say(channel, `/me No commands saved yet...`)
      else this.client.say(channel, `/me There's the current commands: '${printables.join(`', '`)}'.`)
    }
  }

  private generateListener = (command) => {
    return (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
      let tester = command.command
      if (new RegExp('^' + tester, 'i').test(message) && (!command.mods || msg.userInfo.isMod || msg.userInfo.isBroadcaster)) {
        if (this.timeout(10, tester === '!pp' ? tester + user : tester)) return
        let answer = command.answer
        let inputs: string[] = message.replace(`${command.command} `, '').split(' ')
        let shift = () => {
          if (inputs.length < 1) throw new Error()
          return inputs.shift()
        }

        try {
          for (let i = 0; i < command.params.length; i++) {
            let p = command.params[i]

            if (new RegExp(RGX_USER).test(p)) {
              answer = answer.replace(`{{${i}}}`, /@user/gi.test(p) ? `@${msg.userInfo.displayName}` : inputs.length === 1 && /@\w+/ ? p : shift())
            } else if (new RegExp(RGX_EVAL).test(p)) {
              answer = answer.replace(`{{${i}}}`, `${eval(p.replace(/^\$eval\(/, '').replace(/\)$/, ''))}`)
            } else if (new RegExp(RGX_RAND).test(p)) {
              let num = parseInt(p.replace(`$rnd`, ''))
              answer = answer.replace(`{{${i}}}`, `${Math.floor(Math.random() * ++num)}`)
            }
          }
          this.client.say(channel, `/me ${answer}`)
        } catch (e) {
          this.client.say(channel, `/me This command requires more parameters...`)
        }
      }
    }
  }

  confirmation = false
  private flush = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!cmd flush$/i.test(message)) {
      if (!msg.userInfo.isBroadcaster) this.client.say(channel, `/me Only the streamer can flush all commands from db... `)
      else if (this.confirmation) {
        await Command.deleteMany({userId: this.iClient.userId})
        for (let c of this.commands) {
          if (c.listener) this.client.removeMessageListener(c.listener)
        }
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
