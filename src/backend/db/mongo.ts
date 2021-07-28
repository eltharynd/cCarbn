import * as Mongoose from 'mongoose'
import { MONGO } from '../index'

export class Mongo {
  static instance: Mongo

  private database: Mongoose.Connection
  constructor(then?: Function) {
    this.connect(then)
  }

  private connect = async (then?: Function) => {
    if (this.database) return

    Mongoose.connect(MONGO.connection, { useNewUrlParser: true, useUnifiedTopology: true })
    this.database = Mongoose.connection

    this.database.on('error', console.error.bind(console, 'connection error'))
    this.database.once('open', async () => {
      this.Command = Mongoose.model('Command', this.commandSchema)

      //await this.clearAll()
      //await this.save('test', 'Test Works!!!')
      //await this.fetch()

      Mongo.instance = this
      if (then) then()
    })
  }

  save = async (command: string, answer: string, mods?: boolean, params?: string[], source?: string) => {
    let buffer = new this.Command({ command: command, answer: answer, mods: mods ? true : false, params: params?.length > 0 ? params : [], source: source })
    await buffer.save()
    return buffer
  }

  fetch = async (command?: string) => {
    let buffer = await this.Command.find(command ? { command: command } : null)
    return buffer?.length === 1 ? buffer[0] : buffer
  }

  clearAll = async () => {
    await this.Command.deleteMany()
  }

  private Command: Mongoose.Model<any, any>
  private commandSchema = new Mongoose.Schema({
    command: String,
    params: Array,
    answer: String,
    mods: Boolean,
    source: String,
  })
}
