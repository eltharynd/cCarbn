import { Schema, model } from 'mongoose'
import { createModel } from 'mongoose-gridfs'
import * as uuid from 'uuid'
import { Mongo } from '../mongo'

/* export const uploadSchema: Schema = new Schema({
  userId: Schema.Types.ObjectId,
  length: Number,
  chunkSize: Number,
  filename: { type: String, trim: true, searchable: true },
  md5: { type: String, trim: true, searchable: true }
}, { collection: 'tracks.files'}) */


