import { Schema, model } from "mongoose"
import * as merge from 'deepmerge'

const ELEMENT_TEMPLATE = {
  name: 'An event',
  conditions: [{
    type: 'bit',
    operator: 'equals',
    compared: 1
  }],
  events: []
}

export const elementsSchema: Schema = new Schema({
  userId: Schema.Types.ObjectId,
  json: {
    type: Object,
    get: (data) => {
      try { return merge(ELEMENT_TEMPLATE, JSON.parse(data)) } catch(e) { return merge(ELEMENT_TEMPLATE, data) }
    },
    set: (data) => JSON.stringify(data),
    default: {}
  }
})
export const Elements = model('Elements', elementsSchema)
