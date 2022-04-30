import { Schema, model } from "mongoose"

export const commandSchema: Schema = new Schema({
  userId: Schema.Types.ObjectId,
  command: String,
  args: Array,
  params: Array,
  answer: String,
  mods: Boolean,
  streamer: Boolean,
  cooldown: Number,
  cooldownPerUser: Boolean,
  source: String,
})
export const Command = model('Command', commandSchema)