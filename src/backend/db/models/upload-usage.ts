import { Schema, model } from "mongoose"

export const uploadUsage: Schema = new Schema({
  fileId: Schema.Types.ObjectId,
  usages: Number
})
export const UploadUsage = model('UploadUsage', uploadUsage)
