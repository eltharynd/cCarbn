import { Schema, model } from "mongoose"
import * as uuid from 'uuid'

export const userTokenSchema: Schema = new Schema({
  userId: Schema.Types.ObjectId,
  accessToken: String,
  refreshToken: String,
  expiresIn: Number,
  obtainmentTimestamp: {
    type: Date,
    default: Date.now()
  },
  secret: {
    type: String,
    default: uuid.v4()
  },
})
export const UserToken = model('UserToken', userTokenSchema)

export const clientTokenSchema: Schema = new Schema({
  clientId: String,
  clientSecret: String,
  secret: {
    type: String,
    default: uuid.v4()
  },
})
export const ClientToken = model('ClientToken', clientTokenSchema)