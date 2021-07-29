import * as Mongoose from 'mongoose'
import { MONGO } from '../index'
import { Command } from './models/command'

export class Mongo {
  private static database: Mongoose.Connection

  static connect = async (): Promise<boolean> => {
    if (Mongo.database) return true

    return new Promise<boolean>((resolve, reject) => {
      Mongoose.connect(MONGO.connection, { useNewUrlParser: true, useUnifiedTopology: true })
      Mongo.database = Mongoose.connection
      Mongo.database.on('error', console.error.bind(console, 'connection error'))
  
      Mongo.database.once('open', () => {
        //await this.clearAll()
        //await this.save('test', 'Test Works!!!')
        //await this.fetch()

        resolve(true)
      })
    })
  }

  static save = async (command: string, answer: string, mods?: boolean, params?: string[], source?: string) => {
    let buffer = new Command({ command: command, answer: answer, mods: mods ? true : false, params: params?.length > 0 ? params : [], source: source })
    await buffer.save()
    return buffer
  }

  static fetch = async (command?: string): Promise<any> => {
    let buffer = await Command.find(command ? { command: command } : null)
    return buffer?.length === 1 ? buffer[0] : buffer
  }

  static clearAll = async () => {
    await Command.deleteMany()
  }
}
