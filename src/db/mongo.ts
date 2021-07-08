import * as Mongoose from "mongoose";
import { MONGO } from "../index"

export class Mongo {

    
    private database: Mongoose.Connection
    constructor() {
        this.connect()
    }

    private connect = async () => {
        if(this.database) return

        Mongoose.connect(MONGO, {useNewUrlParser: true, useUnifiedTopology: true})
        this.database = Mongoose.connection

        this.database.on('error', console.error.bind(console, 'connection error'))
        this.database.once('open', async () => {

            this.Command = Mongoose.model('Command', this.commandSchema)

            //await this.clearAll()


            //await this.save('test', 'asdasdasd')
            //await this.fetch(null)
        })
    }


    save = async (name: string, command: string) => {
        let buffer = new this.Command({name: name, command: command })
        await buffer.save()
    }

    fetch = async (name: string) => {
        return await this.Command.find(name? {name: name} : null)
    }

    private clearAll = async () => {
        await this.Command.deleteMany()
    }

    private Command: Mongoose.Model<any, any>
    private commandSchema = new Mongoose.Schema({
        name: String,
        command: String,
        mods: Boolean
    })
}

