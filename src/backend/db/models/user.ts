import { Schema, model, Types } from "mongoose"
import { Mongo } from "../mongo"
import { Settings } from "./settings"
import { Command } from "./command"
import { ClientToken, UserToken } from "./tokens"


interface IUser {
  token: string
  admin: boolean

  founder: boolean
  supporter: boolean
  premium: boolean

  twitchId: string
  twitchName: string
  twitchDisplayName: string
  twitchPic: string

  ttsStart: Date
  ttsCharacters: number

  created: Date
  lastLogin: Date
}
export const userSchema: Schema = new Schema({
  token: String,
  
  admin: Boolean,

  founder: Boolean,
  supporter: Boolean,
  premium: Boolean,

  twitchId: String,
  twitchName: String,
  twitchDisplayName: String,
  twitchPic: String,

  ttsStart: Date,
  ttsCharacters: Number,

  created: {
    type: Date,
    default: Date.now()
  },
  lastLogin: {
    type: Date,
    default: Date.now()
  },
})
export const User = model<IUser>('User', userSchema)

export const deleteUser = async (userMongoId: string | Types.ObjectId) => {
  let userId = userMongoId.toString()
  let user: any = await User.findOne({_id: userId})
  let userTokem: any = await UserToken.deleteMany({userId: userId})
  let clientToken: any = await ClientToken.deleteMany({userId: userId})
  let settings: any = await Settings.deleteMany({userId: userId})
  let commands: any = await Command.deleteMany({userId: userId})
  let files: any = await Mongo.Upload.find({ metadata: { userId: Mongo.ObjectId(userId) } })
  for(let i of userTokem) {
    await Mongo.Upload.unlink({ _id: i._id}, (error, unlink) => {})
  }
  await User.deleteOne({_id: userId})
}