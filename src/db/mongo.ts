import * as Mongoose from "mongoose";
import { MONGO } from "../index"

export class Mongo {

    static instance
    
    private database: Mongoose.Connection
    constructor(then?: Function) {
        this.connect(then)
    }

    private connect = async (then?: Function) => {
        if(this.database) return

        Mongoose.connect(MONGO.connection, {useNewUrlParser: true, useUnifiedTopology: true})
        this.database = Mongoose.connection

        this.database.on('error', console.error.bind(console, 'connection error'))
        this.database.once('open', async () => {

            this.Command = Mongoose.model('Command', this.commandSchema)

            //await this.clearAll()
            //await this.save('test', 'asdasdasd')
            let res = await this.fetch(null)
            console.log(res)


            Mongo.instance = this
            if(then) then()
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

