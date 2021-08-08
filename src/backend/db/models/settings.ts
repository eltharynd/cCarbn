import { Schema, model } from "mongoose"

const SETTINGS_TEMPLATE = {
  api: {
    enabled: false,
    listeners: {
      ban: false,
      cheer: false,
      follow: false,
      hypetrain: false,
      moderator: false,
      poll: false,
      prediction: false,
      raid: false,
      redemption: false,
      reward: false,
      subscription: false,
      update: false,
      //EventSubExtensionBitsTransactionCreateEvent ???
      online: false
      //EventSubUserUpdateEvent
    }
  },
  chatbot: {
    enabled: false,
    categories: {
      common: false,
      everyone: false,
      moderators: false,
      storeable: false
    }
  }
}

export const settingsSchema: Schema = new Schema({
  userId: Schema.Types.ObjectId,
  json: {
    type: Object,
    get: (data) => {
      try { return JSON.parse(JSON.stringify(Object.assign(SETTINGS_TEMPLATE, JSON.parse(data)))) } catch(e) { return data }
    },
    set: (data) => JSON.stringify(data),
    default: {}
  }
})
export const Settings = model('Settings', settingsSchema)
