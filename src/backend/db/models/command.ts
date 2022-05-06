import { Schema, model, Types } from "mongoose"

interface ICommand {
  userId: Types.ObjectId
  command: String
  args: Array<string>
  answer: string
  mods: boolean
  streamer: boolean
  alertable: boolean
  cooldown: number
  cooldownPerUser: boolean
  source: string
}
export const commandSchema: Schema = new Schema({
  userId: Types.ObjectId,
  command: String,
  args: Array,
  answer: String,
  mods: Boolean,
  streamer: Boolean,
  alertable: Boolean,
  cooldown: Number,
  cooldownPerUser: Boolean,
  source: String,
})
export const Command = model('Command', commandSchema)