import { Schema, model, Document } from "mongoose"

export const userSchema: Schema = new Schema({
  token: String,
  admin: Boolean,
  twitchId: String,
  twitchName: String,
  twitchPic: String,
  created: {
    type: Date,
    default: Date.now()
  }
})
export const User = model('User', userSchema)
