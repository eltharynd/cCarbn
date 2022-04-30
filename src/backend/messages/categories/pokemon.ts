import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage'
import axios from 'axios'
import { Chat } from '../../twitch/chat'
import { filterParameters, Message } from '../message'
export class Pokemon extends Message {
  public constructor(iClient) {
    super(iClient)
    this._init()
  }

  private evolution = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!evo [\w\s]+/i.test(message)) {
      let pokemon = message.replace(/^!\w+ /, '').toLowerCase()
      let data

      if(pokemon === 'rockruff' || pokemon === ' lycanroc'){
        this.client.say(channel, `/me listen, it's complicated... just check this stuff out https://bulbapedia.bulbagarden.net/wiki/Rockruff_(Pok%C3%A9mon)#Evolution`)
        return
      }

      try {
        data = (await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.replace(' ', '-')}`)).data
      } catch (error) {
        this.client.say(channel, `/me Sorry I couldn't find that pokemon... Try checking your spelling...`)
        return
      }
      if (!data || !data.id) {
        this.client.say(channel, `/me Sorry I couldn't find that pokemon... Try checking your spelling...`)
        return
      }

      let chain = (await axios.get(`${data.evolution_chain.url}`)).data.chain

      let process = (pokemon) => {
        let text = ''
        let details = pokemon.evolution_details[pokemon.evolution_details.length-1]
        text += ` evolves into ${pokemon.species.name.toUpperCase()}`
        if(details.min_level>0)
          text += ` at lvl ${details.min_level}`
        if(details.item)
          text += ` by using ${details.item.name.toUpperCase()}`
        if(details.trigger?.name === 'trade')
          text += ` from trading`
        if(details.trigger?.name === 'spin')
          text += ` from spinning around`
        if(details.trade_species)
          text += ` with a ${details.trade_species.name.toUpperCase()}` 
        if(details.held_item)
          text += ` while holding ${details.held_item.name.toUpperCase()}`
        if(details.min_happiness)
          text += ` from high happiness`
        if(details.min_affection)
          text += ` from high affection`
        if(details.turn_upside_down)
          text += ` while holding your console upside down`
        if(details.min_beauty)
          text += ` from high beauty`
        if(details.needs_overworld_rain)
          text += ` only when raining`
        if(details.time_of_day)
          text += ` only during the ${details.time_of_day}`
        if(details.known_move)
          text += ` whilst knowing ${details.known_move.name.toUpperCase()}`
        if(details.location)
          text += ` when in the ${details.location.name.toUpperCase()}`
        if(details.known_move_type)
          text += ` whilst knowing a ${details.known_move_type.name.toUpperCase()} move`
        if(details.relative_physical_stats !== null)
          text += ` only when ${details.relative_physical_stats>0 ? 'ATT>SPA' : details.relative_physical_stats<0 ? 'SPA>ATT' : 'ATT=SPA'}`
        return text
      }

      let text = chain.species.name.toUpperCase()
      if(chain.evolves_to.length>0) {
        for(let i=0; i<chain.evolves_to.length; i++) {
          
          let pokemon = chain.evolves_to[i] 
          text += process(pokemon)
          for(let j=0; j<pokemon.evolves_to.length; j++) {
              let pokemon2 = pokemon.evolves_to[j]
              text += process(pokemon2)
              for(let k=0; k<pokemon2.evolves_to.length; k++) {
                let pokemon3 = pokemon2.evolves_to[k]
                text += process(pokemon3)
                for(let l=0; l<pokemon3.evolves_to.length; l++) {
                  let pokemon4 = pokemon3.evolves_to[l]
                  text += process(pokemon4)
              }
            }
          }
          if(i>=0 && i<chain.evolves_to.length-1)
            text += ' or it'
        }

      } else 
        text += ` does not evolve.`

     
      this.client.say(
        channel,
        `/me ${text}`.replace(/\n/g, '')
      )
    } else if (/^!evo/i.test(message)) {
      this.client.say(channel, `/me You didn't specify a pokemon to look up for...`)
    }
  }

  private weakness = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!weak [\w\s]+/i.test(message)) {

      let pokemon = message.replace(/^!weak /, '')
      let data

      if(pokemon === 'joe') {
        this.client.say(channel, `/me joe mama is weak to [PHYSICAL_EXERCISE] unless it's also [SLEEPING_WITH_CHAT]. Awkward`)
        return
      }
      
      try {
        data = (await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.replace(' ', '-')}`)).data
      } catch (error) {
        this.client.say(channel, `/me Sorry I couldn't find that pokemon... Try checking your spelling...`)
        return
      }
      if (!data || !data.types) {
        this.client.say(channel, `/me Sorry I couldn't find that pokemon... Try checking your spelling...`)
        return
      }

      let weaknesses: any = []
      for (let t of data.types) weaknesses.push((await axios.get(t.type.url)).data)

      let weakness = {}
      for (let w of weaknesses) 
        for (let key of Object.keys(w.damage_relations)) {
          if (/_from/.test(key)) {
            let relation: any = w.damage_relations[key];
            let multiplier = key === 'double_damage_from' ? 2 : key === 'half_damage_from' ? 0.5 : key === 'no_damage_from' ? 0 : 1;
            for (let type of relation) weakness[type.name] = weakness.hasOwnProperty(type.name) ? +weakness[type.name] * multiplier : multiplier
          }
        }

      let ordered: any = []
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
      this.client.say(channel, `/me You didn't specify a pokemon to look up for...`)
    }
  }

  private move = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!move [\w\s]+/i.test(message)) {
      if (filterParameters(message).length == 0) {
        this.client.say(channel, `/me You didn't specify a move to look up for...`)
        return
      }

      let move = message.replace(/^!move /, '').toLowerCase()
      let data

      try {
        data = (await axios.get(`https://pokeapi.co/api/v2/move/${move.replace(' ', '-')}`)).data
      } catch (error) {
        this.client.say(channel, `/me Sorry I couldn't find that move... Try checking your spelling...`)
        return
      }

      if (!data || !data.type) {
        this.client.say(channel, `/me Sorry I couldn't find that move... Try checking your spelling...`)
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
      this.client.say(channel, `/me You didn't specify a move to look up for...`)
    }
  }

  private nature = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!nature [\w\s]+/i.test(message)) {
      if (filterParameters(message).length == 0) {
        this.client.say(channel, `/me You didn't specify a move to look up for...`)
        return
      }

      let nature = message.replace(/^!nature /, '').toLowerCase()
      let data

      try {
        data = (await axios.get(`https://pokeapi.co/api/v2/nature/${nature.replace(' ', '-')}`)).data
      } catch (error) {
        this.client.say(channel, `/me Sorry I couldn't find that nature... Try checking your spelling...`)
        return
      }

      if (!data || !data.decreased_stat) {
        this.client.say(channel, `/me Sorry I couldn't find that nature... Try checking your spelling...`)
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
      this.client.say(channel, `/me You didn't specify a nature to look up for...`)
    }
  }

  private ability = async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
    if (/^!ability [\w\s]+/i.test(message)) {
      if (filterParameters(message).length == 0) {
        this.client.say(channel, `/me You didn't specify a move to look up for...`)
        return
      }

      let ability = message.replace(/^!ability /, '').toLowerCase()
      let data

      try {
        data = (await axios.get(`https://pokeapi.co/api/v2/ability/${ability.replace(' ', '-')}`)).data
      } catch (error) {
        this.client.say(channel, `/me Sorry I couldn't find that ability... Try checking your spelling...`)
        return
      }

      if (!data || !data.flavor_text_entries) {
        this.client.say(channel, `/me Sorry I couldn't find that ability... Try checking your spelling...`)
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
        )}.`.replace(/\n/g, '')
      )
    } else if (/^!ability\+ [\w\s]+/i.test(message)) {
      if (filterParameters(message).length == 0) {
        this.client.say(channel, `/me You didn't specify a move to look up for...`)
        return
      }

      let ability = message.replace(/^!ability\+ /, '').toLowerCase()
      let data

      try {
        data = (await axios.get(`https://pokeapi.co/api/v2/ability/${ability.replace(' ', '-')}`)).data
      } catch (error) {
        this.client.say(channel, `/me Sorry I couldn't find that ability... Try checking your spelling...`)
        return
      }

      if (!data || !data.flavor_text_entries) {
        this.client.say(channel, `/me Sorry I couldn't find that ability... Try checking your spelling...`)
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
      this.client.say(channel, `/me You didn't specify a ability to look up for...`)
    }
  }
  
}
