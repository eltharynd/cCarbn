import axios from "axios"
import { encode } from "node:punycode"
import { filterParameters, Message } from "./utils"


export class Everyone extends Message {

    public constructor(client) {
        super(client)
        this.init()
        
    }


    private hands = (channel, tags, message, self) => {
        if(/^!hands/i.test(message) ) {
            
            this.client.say(channel, `/me @cakeums You've been away for 4 minutes 42 seconds... if you factor the pie i determine a 73% probability for washing hands... above your average, not so bad!`)
        }
    }

    private peepoClap = (channel, tags, message, self) => {
        if(/peepoClap/.test(message)) {
            if(this.timeout(5)) return
            this.client.say(channel, `/me peepoClap peepoClap peepoClap peepoClap peepoClap peepoClap peepoClap peepoClap peepoClap peepoClap peepoClap peepoClap peepoClap peepoClap peepoClap `)
        }
    }


    private pantsGrabBackToCakeums = (channel, tags, message, self) => {
        if(self) return
        if(/cakeums/i.test(tags.username) && /^PantsGrab$/i.test(message)) {
            this.client.say(channel, `/me @${tags.username} no u nouCHEER`)
            setTimeout(() => {
                this.client.say(channel, `/me @${tags.username} also PantsGrab`)
            }, 750);
        }
    }

    private kay = (channel, tags, message, self) => {
        if(/killakayttv/.test(tags.username)) {
            if(this.timeout(20*60)) return
            this.client.say(channel, `/me ^ Whatever @killakayttv just said I agree 100%`)
        }
    }

    private jam = (channel, tags, message, self) => {
        if(/^!jam/i.test(message)) {
            //if(this.timeout(20)) return
            this.client.say(channel, `/me catJAM WE catJAM CAT catJAM WE catJAM JAM catJAM NO catJAM MODS catJAM NO catJAM BAN catJAM`)
        }
    }

    private leydyHype = (channel, tags, message, self) => {
        if(/^!leydy/i.test(message)) {
            if(this.timeout(4)) return
            this.client.say(channel, `/me HIT EM HIT EM blobDance Jammies SMACK EM DOWN hollowD hypeE WE'RE THE LEYDY SQUAD MODS pepeDS AND WE'LL SNATCH THIS RUN ppJedi blobDance`)
        }
    }

    private dick = (channel, tags, message, self) => {
        if(/^!dick/i.test(message)) {
            if(this.timeout(10)) return
            this.client.say(channel, `/me Don't be a dick!!!`)
        }
    }


    
    private greed = (channel, tags, message, self) => {
        if(/^!greed/i.test(message)) {
            if(this.timeout(10)) return
            this.client.say(channel, `/me I promise, this is the last time I was greedy. Never, ever again...`)
        }
    }
    
    private top10  = (channel, tags, message, self) => {
        if(/^!top10/i.test(message)) {
            if(this.timeout(10)) return
            this.client.say(channel, `/me I promise you I will take you to top 10, soon, not right now, someday...`)
        }
    }


    
    private blame = (channel, tags, message, self) => {
        if(/^!blame/i.test(message)) {
            if(this.timeout(10)) return
            this.client.say(channel, `/me I blame @Hayitmeagain as usual! LUL`)
        }
    }

    private origami = (channel, tags, message, self) => {
        if(/^!origami/i.test(message)) {
            if(this.timeout(10)) return
            this.client.say(channel, `/me Trust me I’m an engineer!`)
        }
    }
    private mana = (channel, tags, message, self) => {
        if(/^!mana/i.test(message)) {
            if(this.timeout(10)) return
            this.client.say(channel, `/me Suck a duck!`)
        }
    }
    private bread = (channel, tags, message, self) => {
        if(/^!bread/i.test(message)) {
            if(this.timeout(10)) return
            this.client.say(channel, `/me Yeah, he's dumb!`)
        }
    }
    private rng = (channel, tags, message, self) => {
        if(/^!rng/i.test(message)) {
            if(this.timeout(10)) return
            this.client.say(channel, `/me This is literally the trashiest fucking RNG I've ever seen`)
        }
    }
    private andre = (channel, tags, message, self) => {
        if(/^!andre/i.test(message)) {
            if(this.timeout(10)) return
            let timeout = 750
            this.client.say(channel, `/me I’ve known Andre a long time. Too long. He’s a bit full of himself- why do you think he never wears a shirt. His craftsmanship is poor- I can buy his weapon smith box and do just as good of a job myself. He price gouges. `)
            setTimeout(() => {
            this.client.say(channel, `/me He charges 800 for a damn titanite shard. 800 human souls for a ROCK- when I can easily get one from the frail and decrepit hollows that he’s got protecting his workshop. The man is charging 20000 human souls for a key to a door, when there’s a perfectly good back way that provides a scenic route AND doesn’t have killer trees blocking the path. `) 
                setTimeout(() => {
                    this.client.say(channel, `/me Cake is right in her decision, Andre is the reason the world is falling to crumbles. He’s essentially the bezos of souls. Open your eyes people`) 
                    setTimeout(() => {
                        this.client.say(channel, `/me tho this is necessary for the run, I have to say I really do not agree with this.... RIP andre`) 
                    }, 1500);
                }, timeout);
            }, timeout);


            /* 
            
            
            
            
            
            */
        }
    }


    private time = async (channel, tags, message, self) => {
        if(/^!time \w+/i.test(message)) {
            let par = message.replace(/^!time [\w\s\/]+/i, '')
            console.log(par)
            let data: any 
            try {
                data = (await axios.get(`http://worldtimeapi.org/api/timezone/${par}`)).data
            } catch (e) {}

            if(data && data.abbreviation) {
                this.client.say(channel, `/me I've found time for timezone ${data.abbreviation} do be ${data.datetime.slice(11,16)}`)
                return
            } else if(data && data.length && data.length>0) {
                this.client.say(channel, `/me I've found multiple results... try one of the following: ${data[0]}, ${data[1]}, ${data[2]}, ...`)
                return
            } else {
                try {
                    data = (await axios.get(`http://worldtimeapi.org/api/timezone/${par.replace(/ /g, '_')}`)).data
                } catch (e) {}
                if(data && data.abbreviation) {
                    this.client.say(channel, `/me I've found time for timezone ${data.abbreviation} do be ${data.datetime.slice(11,16)}`)
                    return
                } else if(data && data.length && data.length>0) {
                    this.client.say(channel, `/me I've found multiple results... try one of the following: ${data[0]}, ${data[1]}, ${data[2]}, ...`)
                    return
                } else {
                    this.client.say(channel, `/me I could not find that timezone... try something like '!time CET' (Central European Time, uncle sam....)`)
                }
            }



        }
    }



    voters = {}
    birds = {}
    private voting = async (channel, tags, message, self) => {
        if(/^!vote \w+$/.test(message)) {
            let bird = (await filterParameters(message))[0].toLowerCase()
            let who = tags.username.toLowerCase()


            if(this.voters[who]) {
                this.birds[bird] = Math.max(0, (this.birds[bird] ? +this.birds[bird] : 0) + 1)
                this.birds[this.voters[who]] =  Math.max(0, (this.birds[this.voters[who]] ? +this.birds[this.voters[who]] : 0) - 1)
                this.client.say(channel, `/me ${tags.username} changed his previous vote to frick '${this.voters[who]}', he now wants to frick '${bird}' instead`)
                this.voters[who] = bird
            } else {
                this.birds[bird] = (this.birds[bird] ? +this.birds[bird] : 0) + 1
                this.voters[who] = bird
                this.client.say(channel, `/me ${tags.username} voted to frick '${bird}'.`)
            }


            let winner
            let tier
            let votes = 0
            let total = 0
            for(let key of Object.keys(this.birds)) {
                let item = this.birds[key]
                total += this.birds[key]

                if(item > votes) {
                    winner = key
                    tier = null
                    votes = item
                } else if(item === votes) {
                    tier = key
                }
            }

            if(tier) {
                setTimeout(() => {
                    this.client.say(channel, `/me '${winner}' and '${tier}' are currently tied on top to be fricked next. They've got a total of ${votes} votes winning with a ${(Math.floor((votes/total)*100)/100)*100}%. What should we do if they end up tied? frick em both?`)
                }, 1000)
                
            } else {
                setTimeout(() => {
                    this.client.say(channel, `/me '${winner}' is currently on top to be fricked next. It's got a total of ${votes} votes winning with a ${(Math.floor((votes/total)*100)/100)*100}%.`)
                }, 1000)
                
            }

        } else if(/^!votereset$/.test(message) && (/eltharynd/.test(tags.username) || tags.moderator)) {
            this.client.say(channel, `/me votes have been reset.`)
            this.voters = {}
            this.birds = {}
        } else if(/^!votestatus$/.test(message) ) {
            if(Object.keys(this.voters).length<1) {
                this.client.say(channel, `/me there are currently no votes.... prick!`)
                return
            }
            let winner
            let tier
            let votes = 0
            let total = 0
            for(let key of Object.keys(this.birds)) {
                let item = this.birds[key]
                total += this.birds[key]

                if(item > votes) {
                    winner = key
                    tier = null
                    votes = item
                } else if(item === votes) {
                    tier = key
                }
            }

            if(tier) {
                this.client.say(channel, `/me '${winner}' and '${tier}' are currently tied on top to be fricked next. They've got a total of ${votes} votes winning with a ${(Math.floor((votes/total)*100)/100)*100}%. What should we do if they end up tied? frick em both?`)
            } else {
                this.client.say(channel, `/me '${winner}' is currently on top to be fricked next. It's got a total of ${votes} votes winning with a ${(Math.floor((votes/total)*100)/100)*100}%.`)
            }
        } else if(/^!votelist/i.test(message)) {
            if(Object.keys(this.voters).length<1) {
                this.client.say(channel, `/me there are currently no votes.... prick!`)
                return
            }

            let string
            for(let key of Object.keys(this.birds)) {
                if(string)
                    string += ', '
                else
                    string = ''
                string += `${key}: ${this.birds[key]}` 
            }
            this.client.say(channel, `/me Here's the current casts: ${string}`)
        } else if(/^!vote/i.test(message)) {
            this.client.say(channel, `/me You can cast your votes by typing '!vote YOUR_VOTE' or check status with '!votestatus'`)
        }
    }



    


    private justice = (channel, tags, message, self) => {
        if(/!justice/.test(message)) {
            if(this.timeout(20)) return
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
                                }, 3500);
                            }, 2500);
                        }, 2500);
                    }, 2500);
                }, 1500);
            }, 7000);
        }
    }


    
    username
    rating
    private pp = (channel, tags, message, self) => {
        if(/leydybug/i.test(channel) && /^!pp/i.test(message)) {
            if(!this.username)
            this.username= tags.username
            this.rating = parseInt(message.replace(/I can confirm that .* has /, '').replace('/10 big PP energy.',''))
            setTimeout(() => {
                this.username = null
            }, 1500);
            //this.client.say(channel, `I can confirm that @${tags.username} has ${Math.floor(Math.random() * 11)}/10 big pp energy!`)
        } else if(/leydybug/i.test(channel) && /nightbot/i.test(tags.username) && this.username) {
            this.client.say(channel, `/me @Nightbot uuuh not? @${this.username} clearly ${Math.floor(Math.random() * 5)+11}/10...`)
            this.username = null
            
        } else if(/^!pp/i.test(message)) {
            if(this.timeout(5)) return
            this.client.say(channel, `/me I can confirm that @${tags.username} has ${Math.floor(Math.random() * 10)+1}/10 big pp energy!`)
        }
    }



    private eightBall = (channel, tags, message, self) => {
        if(/^!8ball/i.test(message)) {
            let samples = [
                'As I see it, yes.',
                'Ask again later.',
                'Better not tell you now.',
                'Cannot predict now.',
                'Concentrate and ask again.',
                'Don\'t count on it.',
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
            this.client.say(channel, `/me @${tags.username} ${samples[Math.floor(Math.random() * samples.length)]}`)
        }
    }

    
/*     private hmmm = (channel, tags, message, self) => {
        if(/^hmmm/.test(message)) {
            if(this.timeout(20*60)) return
            this.client.say(channel, `/me analyzing @Laydybug 's hands right now....`)
            setTimeout(() => {
                this.client.say(channel, `/me hands are clean. good job!`)
            }, 3000);
        }
    } */
    
    private kayBan = (channel, tags, message, self) => {
        if(/^!kay/.test(message)) {
            if(this.timeout(20)) return
            this.client.say(channel, `/me You mess with @killakayttv you get the ban hammer.`)
            setTimeout(() => {
                this.client.say(channel, `/me I swear to fucking god!`)
            }, 500);
        }
    }

    


    private dadjokes = async (channel, tags, message, self) => {
        if(/^!hitusup/i.test(message)) {
            if(this.timeout(5)) return
            let facts = (await axios.get(`https://icanhazdadjoke.com/`, {
                headers: {
                    'Accept': 'application/json'
                }
            })).data
            if(facts)
                this.client.say(channel, `/me ${facts.joke}`)
            else
                this.client.say(channel, `/me I'm trying to get some cool dad jokes but this dudes aren't answering... I suppose that's what you get with free APIs`)
        }
    }

/*      private darkjokes = async (channel, tags, message, self) => {
        if(/^!dark/i.test(message)) {
            if(this.timeout(5)) return
            let result = (await axios.get(`https://v2.jokeapi.dev/joke/Dark` + '?blacklistFlags=religious,political,racist,sexist', {
                headers: {
                    'Accept': 'application/json'
                }
            })).data
            if(result && result.joke) {
                this.client.say(channel, `/me ${result.joke}`)
            } else if(result && result.setup) {
                this.client.say(channel, `/me ${result.setup}`) 
                setTimeout(() => {
                    this.client.say(channel, `/me ${result.delivery}`) 
                }, 5000);
            } else
                this.client.say(channel, `/me I'm trying to get some cool dark jokes but this dudes aren't answering... I suppose that's what you get with free APIs`)
        }
    }  */


 
    private weakness = async (channel, tags, message, self) => {
        if(/^!weak [\w\s]+/i.test(message)) {
            let pokemon = message.replace(/^!weak /, '')
            let data

            try {
                data = (await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.replace(' ', '-')}`)).data
            } catch (error) {
                this.client.say(channel, `/me Sorry I couldn't find that pokemon... check your spelling bitch!`)
                return
            }
            if(!data || !data.types) {
                this.client.say(channel, `/me Sorry I couldn't find that pokemon... check your spelling bitch!`)
                return 
            }

            let weaknesses = []
            for(let t of data.types)
                weaknesses.push((await axios.get(t.type.url)).data)

            let weakness = {}
            for(let w of weaknesses)
                for(let key of Object.keys(w.damage_relations)) {
                    if(/_from/.test(key)) {
                        let relation = w.damage_relations[key]
                        let multiplier = key === 'double_damage_from' ? 2 : key === 'half_damage_from' ? .5 : key === 'no_damage_from' ? 0 : 1
                        for(let type of relation)
                        weakness[type.name] =  weakness[type.name] ?  weakness[type.name] * multiplier : multiplier
                    }
                    
                }
            
            let ordered = []
            for(let key of Object.keys(weakness))
                ordered.push({type: key, multiplier: weakness[key]})
            ordered = ordered.sort((a, b) => {return b.multiplier-a.multiplier})

            let weakString = ''
            let resistString = ''
            let immuneString = ''
            for(let type of ordered) {
                if(type.multiplier===4) {
                    weakString += `4x[${type.type.toUpperCase()}] `
                } if(type.multiplier===2) {
                    weakString += `2x[${type.type.toUpperCase()}] `
                } if(type.multiplier===0.5) {
                    resistString += `1/2[${type.type.toUpperCase()}] `
                } if(type.multiplier===0.25) {
                    resistString += `1/4[${type.type.toUpperCase()}] `
                } if(type.multiplier===0) {
                    immuneString += `[${type.type.toUpperCase()}] `
                } 
            }
            this.client.say(channel, `/me 
                ${data.name.substring(0,1).toUpperCase()}${data.name.substring(1)} typings is: [${data.types[0].type.name.toUpperCase()}]${data.types.length>1 ? `[${data.types[1].type.name.toUpperCase()}]` : ''}.
                It has the following weaknesses: ${weakString.length>0 ? weakString : 'None! Get Fucked!'} - 
                And the following resistances: ${resistString.length>0 ? resistString : 'None! Just hit him!'}
                ${immuneString.length>0 ? ` - But watch out cause he's immune to: ${immuneString}` : ''}
            `.replace(/\n/g, ''))

            
        } else if(/^!weak/i.test(message)) {
            this.client.say(channel, `/me You didn't specify a pokemon to look up for... You piece of shit...`)
        }
    }
     

    private move = async (channel, tags, message, self) => {
        if(/^!move [\w\s]+/i.test(message)) {
            if(filterParameters(message).length==0) {
                this.client.say(channel, `/me You didn't specify a move to look up for... You piece of shit...`)
                return
            }
            
            let move = message.replace(/^!move /, '').toLowerCase()
            let data

            try {
                data = (await axios.get(`https://pokeapi.co/api/v2/move/${move.replace(' ', '-')}`)).data
            } catch (error) {
                this.client.say(channel, `/me Sorry I couldn't find that move... check your spelling bitch!`)
                return
            }

            if(!data || !data.type) {
                this.client.say(channel, `/me Sorry I couldn't find that move... check your spelling bitch!`)
                return 
            }

            this.client.say(channel, `/me ${move.substring(0,1).toUpperCase()}${move.substring(1)} is a [${data.type.name.toUpperCase()}] ${data.damage_class.name.toUpperCase()} move${data.accuracy ? ` with ${data.accuracy}% accuracy`: ''}. It has ${data.power ? data.power : 0} power and ${data.pp ? data.pp : 0} pp. Its description reads: ${data.flavor_text_entries[0].flavor_text.replace(/\n/g, ' ')}. ${data.priority !==0 ? `It also has PRIORITY of ${data.priority}.` : ''}`.replace(/\n/g, ''))
            
        } else if(/^!move/i.test(message)) {
            this.client.say(channel, `/me You didn't specify a move to look up for... You piece of shit...`)
        }
    }

    private nature = async (channel, tags, message, self) => {
        if(/^!nature [\w\s]+/i.test(message)) {
            if(filterParameters(message).length==0) {
                this.client.say(channel, `/me You didn't specify a move to look up for... You piece of shit...`)
                return
            }
            
            let nature = message.replace(/^!nature /, '').toLowerCase()
            let data

            try {
                data = (await axios.get(`https://pokeapi.co/api/v2/nature/${nature.replace(' ', '-')}`)).data
            } catch (error) {
                this.client.say(channel, `/me Sorry I couldn't find that nature... check your spelling bitch!`)
                return
            }

            if(!data || !data.decreased_stat) {
                this.client.say(channel, `/me Sorry I couldn't find that nature... check your spelling bitch!`)
                return 
            }

            this.client.say(channel, `/me pokemon with a ${nature.toUpperCase()} nature have increased ${data.increased_stat.name.toUpperCase()} and decreased ${data.decreased_stat.name.toUpperCase()}`.replace(/\n/g, ''))
            
        } else if(/^!nature/i.test(message)) {
            this.client.say(channel, `/me You didn't specify a nature to look up for... You piece of shit...`)
        }
    }
     
    private ability = async (channel, tags, message, self) => {
        if(/^!ability [\w\s]+/i.test(message)) {
            if(filterParameters(message).length==0) {
                this.client.say(channel, `/me You didn't specify a move to look up for... You piece of shit...`)
                return
            }
            
            let ability = message.replace(/^!ability /, '').toLowerCase()
            let data

            try {
                data = (await axios.get(`https://pokeapi.co/api/v2/ability/${ability.replace(' ', '-')}`)).data
            } catch (error) {
                this.client.say(channel, `/me Sorry I couldn't find that ability... check your spelling bitch!`)
                return
            }

            //console.log(ability)
            if(!data || !data.flavor_text_entries) {
                this.client.say(channel, `/me Sorry I couldn't find that ability... check your spelling bitch!`)
                return 
            }

            let text
            for(let f of data.effect_entries) {
                if(f.language.name === "en") {
                    text = f.effect.replace(/\n/g, ' ')
                    break
                }
            }


            this.client.say(channel, `/me ${ability.substring(0,1).toUpperCase()}${ability.substring(1)} ability: ${data.flavor_text_entries[0].flavor_text.replace(/\n/g, ' ')}. To have more detailed info use '!ability+ ${ability}'`.replace(/\n/g, ''))

        } else if(/^!ability\+ [\w\s]+/i.test(message)) {
            
            if(filterParameters(message).length==0) {
                this.client.say(channel, `/me You didn't specify a move to look up for... You piece of shit...`)
                return
            }
            
            let ability = message.replace(/^!ability\+ /, '').toLowerCase()
            let data

            try {
                data = (await axios.get(`https://pokeapi.co/api/v2/ability/${ability.replace(' ', '-')}`)).data
            } catch (error) {
                this.client.say(channel, `/me Sorry I couldn't find that ability... check your spelling bitch!`)
                return
            }

            if(!data || !data.flavor_text_entries) {
                this.client.say(channel, `/me Sorry I couldn't find that ability... check your spelling bitch!`)
                return 
            }

            let text
            for(let f of data.effect_entries) {
                if(f.language.name === "en") {
                    text = f.effect.replace(/\n/g, ' ')
                    break
                }
            }
            this.client.say(channel, `/me ${text}`.replace(/\n/g, ''))
            
        }else if(/^!ability/i.test(message)) {
            this.client.say(channel, `/me You didn't specify a ability to look up for... You piece of shit...`)
        }
    }
    

}

