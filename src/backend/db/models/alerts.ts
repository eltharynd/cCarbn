import { Schema, model, Types } from 'mongoose'

const ALERT_TEMPLATE = {
  name: 'An alert',
  enabled: true,
  conditions: [
    {
      type: null,
      operator: null,
      compared: null,
    },
  ],
  elements: [{ placeholder: true }],
}

interface IAlerts {
  userId: Types.ObjectId
  alerts: Array<Object>
}
export const alertsSchema: Schema = new Schema({
  userId: Types.ObjectId,
  alerts: [Object],
})
export const Alerts = model<IAlerts>('Alerts', alertsSchema)
