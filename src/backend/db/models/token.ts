import { Schema, model } from "mongoose"

export const tokenSchema: Schema = new Schema({
  command: String,
  params: Array,
  answer: String,
  mods: Boolean,
  source: String,
})
export const Token = model('Token', tokenSchema)