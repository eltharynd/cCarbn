import { Schema, model } from "mongoose"
import * as merge from 'deepmerge'

const EVENT_TEMPLATE = {
  name: 'An event',
  conditions: [{
    type: 'bit',
    operator: 'equals',
    compared: 1
  }],
  events: []
}

export const eventsSchema: Schema = new Schema({
  userId: Schema.Types.ObjectId,
  json: {
    type: Object,
    get: (data) => {
      try { return merge(EVENT_TEMPLATE, JSON.parse(data)) } catch(e) { return merge(EVENT_TEMPLATE, data) }
    },
    set: (data) => JSON.stringify(data),
    default: {}
  }
})
export const Events = model('Events', eventsSchema)
