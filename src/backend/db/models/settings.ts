import { Schema, model } from "mongoose"

export const settingsSchema: Schema = new Schema({
  userId: Schema.Types.ObjectId,
  json: {
    type: Object,
    get: (data) => {
      try { return JSON.parse(data) } catch(e) { return data }
    },
    set: (data) => JSON.stringify(data)
  }
})
export const Settings = model('Settings', settingsSchema)

