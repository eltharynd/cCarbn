import * as Mongoose from 'mongoose'
import { MONGO } from '../index'
import { Settings } from './models/settings'
import { ClientToken } from './models/tokens'
export class Mongo {
  private static database: Mongoose.Connection
  
  static clientId
  static clientSecret

  static connect = async (): Promise<boolean> => {
    if (Mongo.database) return true

    return new Promise<boolean>((resolve, reject) => {
      Mongoose.connect(MONGO.connection, { useNewUrlParser: true, useUnifiedTopology: true })
      Mongo.database = Mongoose.connection
      Mongo.database.on('error', console.error.bind(console, 'connection error'))
      Mongo.database.once('open', async () => {

        let defClientToken: any = await ClientToken.findOne()
        Mongo.clientId = defClientToken.clientId
        Mongo.clientSecret = defClientToken.clientSecret

        resolve(true)
      })
    })
  }

  static async clear() {
    await Mongo.database.dropDatabase()
    console.log(await Settings.find())
  }
}
