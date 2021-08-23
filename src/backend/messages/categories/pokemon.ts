import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage'
import axios from 'axios'
import { Chat } from '../../twitch/chat'
import { filterParameters, Message } from '../message'

export class Pokemon extends Message {
  public constructor(iClient) {
    super(iClient)
    this._init()
  }

  private weakness = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!weak [\w\s]+/i.test(message)) {
      let pokemon = message.replace(/^!weak /, '')
      let data

      try {
        data = (await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.replace(' ', '-')}`)).data
      } catch (error) {
        this.client.say(channel, `/me Sorry I couldn't find that pokemon... check your spelling bitch!`)
        return
      }
      if (!data || !data.types) {
        this.client.say(channel, `/me Sorry I couldn't find that pokemon... check your spelling bitch!`)
        return
      }

      let weaknesses = []
      for (let t of data.types) weaknesses.push((await axios.get(t.type.url)).data)

      let weakness = {}
      for (let w of weaknesses)
        for (let key of Object.keys(w.damage_relations)) {
          if (/_from/.test(key)) {
            let relation = w.damage_relations[key]
            let multiplier = key === 'double_damage_from' ? 2 : key === 'half_damage_from' ? 0.5 : key === 'no_damage_from' ? 0 : 1
            for (let type of relation) weakness[type.name] = weakness[type.name] ? weakness[type.name] * multiplier : multiplier
          }
        }

      let ordered = []
      for (let key of Object.keys(weakness)) ordered.push({ type: key, multiplier: weakness[key] })
      ordered = ordered.sort((a, b) => {
        return b.multiplier - a.multiplier
      })

      let weakString = ''
      let resistString = ''
      let immuneString = ''
      for (let type of ordered) {
        if (type.multiplier === 4) {
          weakString += `4x[${type.type.toUpperCase()}] `
        }
        if (type.multiplier === 2) {
          weakString += `2x[${type.type.toUpperCase()}] `
        }
        if (type.multiplier === 0.5) {
          resistString += `1/2[${type.type.toUpperCase()}] `
        }
        if (type.multiplier === 0.25) {
          resistString += `1/4[${type.type.toUpperCase()}] `
        }
        if (type.multiplier === 0) {
          immuneString += `[${type.type.toUpperCase()}] `
        }
      }
      this.client.say(
        channel,
        `/me
                ${data.name.substring(0, 1).toUpperCase()}${data.name.substring(1)} typings is: [${data.types[0].type.name.toUpperCase()}]${
          data.types.length > 1 ? `[${data.types[1].type.name.toUpperCase()}]` : ''
        }.
                It has the following weaknesses: ${weakString.length > 0 ? weakString : 'None! Get Fucked!'} -
                And the following resistances: ${resistString.length > 0 ? resistString : 'None! Just hit him!'}
                ${immuneString.length > 0 ? ` - But watch out cause he's immune to: ${immuneString}` : ''}
            `.replace(/\n/g, '')
      )
    } else if (/^!weak/i.test(message)) {
      this.client.say(channel, `/me You didn't specify a pokemon to look up for... You piece of shit...`)
    }
  }

  private move = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!move [\w\s]+/i.test(message)) {
      if (filterParameters(message).length == 0) {
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

      if (!data || !data.type) {
        this.client.say(channel, `/me Sorry I couldn't find that move... check your spelling bitch!`)
        return
      }

      this.client.say(
        channel,
        `/me ${move.substring(0, 1).toUpperCase()}${move.substring(1)} is a [${data.type.name.toUpperCase()}] ${data.damage_class.name.toUpperCase()} move${
          data.accuracy ? ` with ${data.accuracy}% accuracy` : ''
        }. It has ${data.power ? data.power : 0} power and ${data.pp ? data.pp : 0} pp. Its description reads: ${data.flavor_text_entries[0].flavor_text.replace(/\n/g, ' ')}. ${
          data.priority !== 0 ? `It also has PRIORITY of ${data.priority}.` : ''
        }`.replace(/\n/g, '')
      )
    } else if (/^!move/i.test(message)) {
      this.client.say(channel, `/me You didn't specify a move to look up for... You piece of shit...`)
    }
  }

  private nature = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!nature [\w\s]+/i.test(message)) {
      if (filterParameters(message).length == 0) {
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

      if (!data || !data.decreased_stat) {
        this.client.say(channel, `/me Sorry I couldn't find that nature... check your spelling bitch!`)
        return
      }

      this.client.say(
        channel,
        `/me pokemon with a ${nature.toUpperCase()} nature have increased ${data.increased_stat.name.toUpperCase()} and decreased ${data.decreased_stat.name.toUpperCase()}`.replace(
          /\n/g,
          ''
        )
      )
    } else if (/^!nature/i.test(message)) {
      this.client.say(channel, `/me You didn't specify a nature to look up for... You piece of shit...`)
    }
  }

  private ability = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!ability [\w\s]+/i.test(message)) {
      if (filterParameters(message).length == 0) {
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

      if (!data || !data.flavor_text_entries) {
        this.client.say(channel, `/me Sorry I couldn't find that ability... check your spelling bitch!`)
        return
      }

      let text
      for (let f of data.effect_entries) {
        if (f.language.name === 'en') {
          text = f.effect.replace(/\n/g, ' ')
          break
        }
      }

      this.client.say(
        channel,
        `/me ${ability.substring(0, 1).toUpperCase()}${ability.substring(1)} ability: ${data.flavor_text_entries[0].flavor_text.replace(
          /\n/g,
          ' '
        )}. To have more detailed info use '!ability+ ${ability}'`.replace(/\n/g, '')
      )
    } else if (/^!ability\+ [\w\s]+/i.test(message)) {
      if (filterParameters(message).length == 0) {
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

      if (!data || !data.flavor_text_entries) {
        this.client.say(channel, `/me Sorry I couldn't find that ability... check your spelling bitch!`)
        return
      }

      let text
      for (let f of data.effect_entries) {
        if (f.language.name === 'en') {
          text = f.effect.replace(/\n/g, ' ')
          break
        }
      }
      this.client.say(channel, `/me ${text}`.replace(/\n/g, ''))
    } else if (/^!ability/i.test(message)) {
      this.client.say(channel, `/me You didn't specify a ability to look up for... You piece of shit...`)
    }
  }
  
}
