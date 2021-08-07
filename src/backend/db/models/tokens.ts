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
export const DefaultUserToken = model('DefaultUserToken', userTokenSchema)

export const clientTokenSchema: Schema = new Schema({
  userId: Schema.Types.ObjectId,
  clientId: String,
  clientSecret: String
})
//TODO do i need this??? users log into this client so it shouldn't matter....
//export const ClientToken = model('ClientToken', clientTokenSchema)
export const DefaultClientToken = model('DefaultClientToken', clientTokenSchema)