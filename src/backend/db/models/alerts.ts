import { Schema, model, Types } from "mongoose"
import * as merge from 'deepmerge'

const ALERT_TEMPLATE = {
  name: 'An alert',
  conditions: [{
    type: 'bit',
    operator: 'equals',
    compared: 1
  }],
  elements: []
}

interface IAlerts {
  userId: Types.ObjectId,
  alerts: object
}
export const alertsSchema: Schema = new Schema({
  userId: Types.ObjectId,
  alerts: {
    type: Object,
    get: (data) => {
      try { return merge(ALERT_TEMPLATE, JSON.parse(data)) } catch(e) { return merge(ALERT_TEMPLATE, data) }
    },
    set: (data) => JSON.stringify(data),
    default: {}
  }
})
export const Alerts = model<IAlerts>('Alerts', alertsSchema)