import * as Mongoose from "mongoose";
import { MONGO } from "../index"

export class Mongo {

    private database: Mongoose.Connection
    constructor() {
        this.connect()
    }

    private connect = () => {
        if(this.database) return

        console.log(MONGO)
        //Mongoose.connect(MONGO)
    }

}