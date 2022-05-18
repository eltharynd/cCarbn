import { Schema, model, Types } from 'mongoose'
import * as uuid from 'uuid'

interface IUserToken {
  userId: Types.ObjectId
  accessToken: string
  refreshToken: string
  expiresIn: number
  obtainmentTimestamp: Date
  secret: string
}
export const userTokenSchema: Schema = new Schema({
  userId: Types.ObjectId,
  accessToken: String,
  refreshToken: String,
  expiresIn: Number,
  obtainmentTimestamp: {
    type: Date,
    default: Date.now(),
  },
  secret: {
    type: String,
    default: uuid.v4(),
  },
})
export const UserToken = model<IUserToken>('UserToken', userTokenSchema)

interface IClientToken {
  clientId: string
  clientSecret: string
  secret: string
}
export const clientTokenSchema: Schema = new Schema({
  clientId: String,
  clientSecret: String,
  secret: {
    type: String,
    default: uuid.v4(),
  },
})
export const ClientToken = model<IClientToken>('ClientToken', clientTokenSchema)
