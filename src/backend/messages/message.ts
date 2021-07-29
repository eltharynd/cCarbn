import { Chat } from '../twitch/chat'

export const filterParameters = (message) => {
  let parameters = message.split(' ')
  parameters.shift()
  return parameters
}

export class Message {
  private cooldowns = {}

  protected init = () => {
    let keys = []
    for (let key of Object.keys(this))
      if (typeof this[key] === 'function' && key !== 'init' && key !== 'timeout' && key !== 'fetch' && key !== 'exists' && key !== 'mod' && key !== 'generateListener')
        keys.push(key)
    Chat.client.onMessage((channel, user, message, msg) => {
      for (let key of keys) this[key](channel, user, message, msg)
    })
  }

  protected timeout = (timeInSeconds?: number, identifier?: string): boolean => {
    let caller = identifier
      ? identifier
      : new Error().stack
          .split('\n')[2]
          .replace(/^.*\.\_this\./, '')
          .replace(/ \(.*\)$/, '')
    if (timeInSeconds && Date.now() - this.cooldowns[caller] < timeInSeconds * 1000) {
      return true
    } else {
      this.cooldowns[caller] = Date.now()
      return false
    }
  }
}
