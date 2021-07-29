import { Schema, model } from "mongoose"

export const commandSchema: Schema = new Schema({
  command: String,
  params: Array,
  answer: String,
  mods: Boolean,
  source: String,
})
export const Command = model('Command', commandSchema)