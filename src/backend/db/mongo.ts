import * as Mongoose from 'mongoose'
import { MONGO } from '../index'

export class Mongo {
  private static database: Mongoose.Connection

  static connect = async (): Promise<boolean> => {
    if (Mongo.database) return true

    return new Promise<boolean>((resolve, reject) => {
      Mongoose.connect(MONGO.connection, { useNewUrlParser: true, useUnifiedTopology: true })
      Mongo.database = Mongoose.connection
      Mongo.database.on('error', console.error.bind(console, 'connection error'))
  
      Mongo.database.once('open', () => {
        Mongo.Command = Mongoose.model('Command', Mongo.commandSchema)
  
        //await this.clearAll()
        //await this.save('test', 'Test Works!!!')
        //await this.fetch()

        resolve(true)
      })
    })
  }

  static save = async (command: string, answer: string, mods?: boolean, params?: string[], source?: string) => {
    let buffer = new Mongo.Command({ command: command, answer: answer, mods: mods ? true : false, params: params?.length > 0 ? params : [], source: source })
    await buffer.save()
    return buffer
  }

  static fetch = async (command?: string) => {
    let buffer = await Mongo.Command.find(command ? { command: command } : null)
    return buffer?.length === 1 ? buffer[0] : buffer
  }

  static clearAll = async () => {
    await Mongo.Command.deleteMany()
  }

  //TODO REFACTOR WITH MODELS IN PROPER FOLDER STRUCTURE
  private static Command: Mongoose.Model<any, any>
  private static commandSchema = new Mongoose.Schema({
    command: String,
    params: Array,
    answer: String,
    mods: Boolean,
    source: String,
  })
}
