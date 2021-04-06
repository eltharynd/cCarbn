import axios from "axios"
import { Twitch } from "../hooks/twitch"
import { filterParameters, Message } from "./utils"


export class Common extends Message {

    public constructor(client) {
        super(client)
        this.init()
        
    }
    
    private hug = (channel, tags, message, self) => {
        if(/^!hug [\@a-zA-Z0-9][a-zA-Z0-9]*/i.test(message) ) {
            console.log(message, filterParameters(message))
            this.client.say(channel, `/me @${tags.username} hugs @${filterParameters(message)[0].replace('@','')} then lowkey licks their cheek!`)
        }
    }

    private ruck = (channel, tags, message, self) => {
        if(/^!tuck [\@a-zA-Z0-9][a-zA-Z0-9]*/i.test(message) ) {
            this.client.say(channel, `/me @${tags.username} tucks @${filterParameters(message)[0].replace('@','')} in their bed! Good Night you PogChamp!`)
        }
    }

    private greetings = (channel, tags, message, self) => {
        if(/@elthabot/i.test(message) && (
            /hi/i.test(message) || 
            /hello/i.test(message) || 
            /what's up/i.test(message) || 
            /o\//i.test(message) 
        )) {
            let options = [
                `@${tags.username} What's up bud? Nice to see you, hope you're doing fine...`,
                `@${tags.username} Hey!!`,
                `@${tags.username} Heya bud`,
                `@${tags.username} Sup dude`,
                `@${tags.username} Hello my friend`,
                `@${tags.username} Nice to see you o/`,
                `@${tags.username} hey it's been a while, how's things?`,
                `Oh look, it's @${tags.username} again... great`,
                `@${tags.username} sup? here to chill a bit as well?`,
                `I was just thinking about you @${tags.username}!!! D: D: D:`,

                `@${tags.username} this is ACTUALLY funny cause my server jsut got a 1 on a Math.random which is pretty fucking incredible if you ask me... I didn't even think this was possible ngl...`
            ]
            this.client.say(channel, options[Math.floor(Math.random() * options.length)])
        }
    }

    private simp = (channel, tags, message, self) => {
        if(/ simp /i.test(message) || / simp[\?\!]/.test(message) || / simp$/.test(message) || / simping /.test(message) || / simping$/.test(message)) {
            if(this.timeout(10)) return
            this.client.say(channel, `/me @${tags.username} We don't use that language over here...`)
        }
    }


    

    private F = (channel, tags, message, self) => {
        if(/^F$/.test(message)) {
            if(this.timeout(20*60)) return
            this.client.say(channel, `/me F`)
        }
    }

    private cats = async (channel, tags, message, self) => {
        if(/^!cat/i.test(message)) {
            if(this.timeout(5)) return
            let facts = (await axios.get(`https://cat-fact.herokuapp.com/facts`)).data
            if(facts && facts.length>0)
                this.client.say(channel, `/me ${facts[Math.floor(Math.random() * facts.length)].text}`)
            else
                this.client.say(channel, `/me I'm trying to get some cool cat facts but this dudes aren't answering... I suppose that's what you get with free APIs`)
        }
    }

    private dogs = async (channel, tags, message, self) => {
        if(/^!dog/i.test(message)) {
            if(this.timeout(5)) return
            let facts = (await axios.get(`https://dog-facts-api.herokuapp.com/api/v1/resources/dogs/all`)).data
            if(facts && facts.length>0)
                this.client.say(channel, `/me ${facts[Math.floor(Math.random() * facts.length)].fact}`)
            else
                this.client.say(channel, `/me I'm trying to get some cool dog facts but this dudes aren't answering... I suppose that's what you get with free APIs`)
        }
    }

    private bttv = async (channel, tags, message, self) => {
        if(/^!bttv/i.test(message) || /^!bttv/i.test(message)) {
            if(this.timeout(30)) return

            this.client.say(channel, `/me Are you a boomer? have you been wondering why chat sometimes types weird shit like DONUT or PepegaCredit ? Well fuck off then. JK, there's two very popular chrome extensions for twitch that allow users to have the dankest emotes of all.. Just go here and give it one click each then refresh the chat page to join the alpha twitchers club. betterttv${/eltharynd/i.test(channel) ? '.' : ''}com and frankerfacez${/eltharynd/i.test(channel) ? '.' : ''}com`)

        }
    }

    private disc = async (channel, tags, message, self) => {
        if(/^!disc/i.test(message) || /^!bttv/i.test(message)) {
            if(this.timeout(30)) return

            this.client.say(channel, `/me You can join our discord at https://discord.gg/FxmSUcCe`)

        }
    }



}

