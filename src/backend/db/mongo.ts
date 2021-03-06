import * as Mongoose from 'mongoose'
import { MONGO } from '../index'
import { ClientToken } from './models/tokens.model'
import { createModel } from 'mongoose-gridfs'
import { IUpload, GridfsModel } from './models/files.model'

export class Mongo {
  private static database: Mongoose.Connection

  static Upload: GridfsModel<IUpload, any, any, any>

  static clientId
  static clientSecret

  static connect = async (): Promise<boolean> => {
    if (Mongo.database) return true

    return new Promise<boolean>(async (resolve, reject) => {
      Mongoose.connect(MONGO.connection)
      Mongo.database = Mongoose.connection
      Mongo.database.on('error', console.error.bind(console, 'connection error'))
      Mongo.database.once('open', async () => {
        let defClientToken: any = await ClientToken.findOne()
        Mongo.clientId = defClientToken.clientId
        Mongo.clientSecret = defClientToken.clientSecret
        Mongo.Upload = createModel({
          modelName: 'Upload',
          connection: Mongo.database,
          metadata: { userId: Mongoose.Types.ObjectId, usages: 1 },
        })
        resolve(true)
      })
    })
  }

  static ObjectId(id: string): Mongoose.Types.ObjectId
  static ObjectId(id: Mongoose.Types.ObjectId): Mongoose.Types.ObjectId
  static ObjectId(id: string | Mongoose.Types.ObjectId): Mongoose.Types.ObjectId {
    if (typeof id === 'string') return new Mongoose.Types.ObjectId(id)
    else return id
  }
}
