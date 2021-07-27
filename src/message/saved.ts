import { from } from "rxjs"
import { filter, take } from "rxjs/operators"
import { Mongo } from "../db/mongo"
import { Message } from "./utils"

const RGX_USER = /\@\w+(\s|$)/gi
const RGX_EVAL = /\$eval\(.+\)(\s|$)/gi
const RGX_RAND = /\$((rand)|(rnd))\d+(\s|$)/gi

const FORMAT_ERROR = 'This command is formatted wrong... Please check your spelling or consult the documentation...'

export class Saved extends Message {

    commands = []

    public constructor(client) {   
        super(client)
        this.fetch(true)
        this.init()
    }


    private fetch = async (bind?) => {
        let buffer = await Mongo.instance.fetch()
        this.commands = buffer instanceof Array ? buffer : [buffer]
        if(bind) for(let c of this.commands) {
            c.listener = await this.generateListener(c)
            this.client.on('message', c.listener)
        }
    }
    
    private exists = async (command) => {
        let result = await from(this.commands).pipe(filter((c) => c.command === command), take(1)).toPromise()
        return result ? result._id : null
    }

    //TODO implement mods only commands
    private command = async (channel, tags, message, self) => {
        if(/^!((command)|(cmd)) ((add)|(save)|(edit)|(delete)|(show)|(answer)|(source)) .+$/i.test(message)) {
            if(!this.mod(tags)) {this.client.say(channel, `/me Only mods can edit commands...`); return}

            let buffer = message.replace(/^!command /i, '').replace(/^!cmd /i, '')
            if(buffer.startsWith('add') || buffer.startsWith('save') || buffer.startsWith('edit')) {
                let edit = buffer.startsWith('edit') ? true : false
                buffer = buffer.replace('add ', '').replace('save ', '').replace('edit ', '')

                let name = buffer.match(/^\!*\w+ /i)
                if(!name) {this.client.say(channel, `/me ${FORMAT_ERROR}`); return}

                name = name[0].replace(' ', '')
                buffer = buffer.replace(/^\!*\w+ /i, '')

                let exists = await this.exists(name)
                if(!edit && exists) {this.client.say(channel, `/me This command already exists... If you want to modify it please use '!cmd edit' instead, if you're not sure what the command is atm you can always use '!cmd source'`); return}

                let targets = buffer.match(new RegExp(RGX_USER))
                let ev = buffer.match(new RegExp(RGX_EVAL))
                let rand = buffer.match(new RegExp(RGX_RAND))

                let index = 0
                let parameters = []
                if(targets) for(let i of targets) {
                    parameters.push(i.replace(' ', ''))
                    buffer = buffer.replace(i, `{{${index++}}} `)
                }

                if(ev) for(let i of ev) {
                    parameters.push(i.replace(/\s$/, ''))
                    buffer = buffer.replace(i, `{{${index++}}} `)
                }
                
                if(rand) for(let i of rand) {
                    parameters.push(i.replace(' ', '').replace('rand', 'rnd'))
                    buffer = buffer.replace(i, `{{${index++}}} `)
                }

            
                let result
                if(exists) {
                    let found = await Mongo.instance.fetch(name)
                    found.command = name
                    found.answer = buffer
                    found.params = parameters
                    found.source = message 
                    found.mods = null
                    found.save()
                    result = found
                } else
                    result = await Mongo.instance.save(name, buffer, null, parameters, message)

                this.commands.push(result)
                result.listener = this.generateListener(result)
                this.client.on('message', result.listener)

                this.client.say(channel, `/me Successfully ${exists ? 'edited' : 'added new'} command...`)
                

            } else if(buffer.startsWith('delete')) {
                buffer = buffer.replace('delete ', '')
 
                let name = buffer.match(/^\!*\w+(\s|$)/i)
                if(!name) {this.client.say(channel, `/me ${FORMAT_ERROR}`); return}
                name = name[0].replace(' ', '')

                let exists = await this.exists(name)
                if(!exists) {this.client.say(channel, `/me This command doesn't exist...`); return}

                let listener = (await from(this.commands).pipe(filter(c => c.command === name), take(1)).toPromise()).listener
                this.client.removeListener('message', listener)
                let found = await Mongo.instance.fetch(name)
                found.delete()
                this.client.say(channel, `/me Successfully deleted command...`)

            } else if(buffer.startsWith('show')) {
                buffer = buffer.replace('show ', '').replace('answer ', '')
                if(await this.exists(buffer))
                    this.client.say(channel, `/me Here's the answer for command "${buffer}": \`${(await Mongo.instance.fetch(buffer)).answer}\``)
                else
                    this.client.say(channel, `/me I couldn't find such command...`)
            } else if(buffer.startsWith('source')) {
                buffer = buffer.replace('source ', '')
                if(await this.exists(buffer))
                    this.client.say(channel, `/me Here's the source for command "${buffer}": \`${(await Mongo.instance.fetch(buffer)).source}\``)
                else
                    this.client.say(channel, `/me I couldn't find such command...`)
            } 

        }
        
    }


    private generateListener = (command) => {
        return (channel, tags, message, self) => {
            if(self) return
            let tester = command.command
            //for(let p of command.params)
            //    tester += `\\s${p.startsWith('@') ? '@\\w+' : '\\w+'}`
            if(new RegExp(tester, 'i').test(message) && (!command.mods || this.mod(tags))) {
                if(this.timeout(10, tester)) return
                let answer = command.answer
                let inputs: string[] = message.replace(`!${command.command} `, '').split(' ')
                let shift = () =>{
                    if(inputs.length<1)
                        throw new Error()
                    return inputs.shift()
                }

                try {
                    for(let i=0; i<command.params.length; i++) {    
                        let p = command.params[i]
                        
                        if(new RegExp(RGX_USER).test(p)) {
                            answer = answer.replace(`{{${i}}}`, /@user/gi.test(p) ? `@${tags.username}` : shift())
                        } else if(new RegExp(RGX_EVAL).test(p)) {
                            answer = answer.replace(`{{${i}}}`, `${eval(p.replace(/^\$eval\(/, '').replace(/\)$/, ''))}`)
                        } else if(new RegExp(RGX_RAND).test(p)) {
                            let num = parseInt(p.replace(`$rnd`, ''))
                            answer = answer.replace(`{{${i}}}`, `${Math.floor(Math.random()*++num)}`)
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
    private flush = async (channel, tags, message, self) => {
        if(/^!cmd flush$/i.test(message)) {
            if(tags.username.toLowerCase() !== channel.replace('#', '').toLowerCase()) 
                this.client.say(channel, `/me Only the streamer can flush all commands from db... `)
            else if(this.confirmation) {
                await Mongo.instance.clearAll()
                for(let c of this.commands) {
                    if(c.listener)
                        this.client.removeListener('message', c.listener)
                }
                this.commands = []
                this.client.say(channel, `/me Oooohkay boss... deleted everything... I hope you know what you're doing...`)
                this.confirmation = false
            } else {
                this.client.say(channel, `/me This command will delete EVERY command you ever saved... They are NOT recoverable... If you're sure about this enter the same command again within 10 seconds...`)
                this.confirmation = true
                setTimeout(() => {
                    this.confirmation = false
                }, 10000);
            }

        }
    }

    private mod(tags) {
        return tags.mod || (tags.badges && tags.badges.broadcaster)
    }
}

