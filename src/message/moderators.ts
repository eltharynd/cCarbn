import { Twitch } from "../hooks/twitch"
import { filterParameters, Message } from "./utils"


export class Moderators extends Message {

    public constructor(client) {
        super(client)
        this.init()
    }

    private shoutout = async (channel, tags, message, self) => {
        if(!this.mod(tags)) return
        

        let parameters = filterParameters(message)
        if(/^!so [\@a-zA-Z0-9][a-zA-Z0-9]*/i.test(message)) {
            if(parameters.length==0) {
                this.client.say(channel, `/me You didn't specify a user to look up for... You piece of shit...`)
                return
            }

            let result = await Twitch.searchChannel(parameters[0].replace('@',''))
            if(result._total>0) {
                let target = result.channels[0]
                let lastPlayed = await Twitch.getStream(target._id)
                this.client.say(channel, 
                    `/me If you're not following ${target.name} i honestly have no fucking clue what you're doing with your useless life. Go follow on: twitch.tv/${target.name}. You won't regret it they're a goddamn legend.
                    ${lastPlayed ? 
                        `They're currently online playing '${target.game}' . D:` :
                        target.game ? `They're offline now but were last seen playing ${target.game}.` : `They've actually never streamed before so.. there's that...`
                    }`.replace(/\n/g, ''))
                
            } else
                this.client.say(channel, `/me I'm sorry i could not find any such channel...`)

        } else if(/^!search/i.test(message)) {
            if(parameters.length==0) {
                this.client.say(channel, `/me You didn't specify a user to look up for... You piece of shit...`)
                return
            }

            let result = await Twitch.searchChannel(parameters[0].replace('@',''))
            if(result._total>0) {
                let target = result.channels[0]
                let lastPlayed = await Twitch.getStream(target._id)
                this.client.say(channel, 
                    `/me I think you meant to look for this channel: twitch.tv/${target.name}.
                    ${lastPlayed ? 
                        `They're currently online playing '${target.game}' . D:` :
                        target.game ? `They're offline now but were last seen playing ${target.game}.` : `They've actually never streamed before so.. there's that...`
                    }`.replace('\n',''))
                
            } else
                this.client.say(channel, `/me I'm sorry i could not find any such channel...`)

        }
           
    }



    private mod(tags) {
        return tags.mod || /eltharynd/i.test(tags.username) || /elthabot/i.test(tags.username.toLowerCase) || (tags.badges && tags.badges.broadcaster)
    }
}