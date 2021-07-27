import  * as express from 'express'
import { createServer } from 'http'
import  * as cors from 'cors'
import * as bodyParser from 'body-parser'
import  * as socketIO from 'socket.io'


export class Socket {

    private app
    private server
    io

    constructor(port: number, connectors?: Socketable[]) {

        this.app = express()
        this.app.use(cors({
            origin: '*',
            optionsSuccessStatus: 200,
        }))
        this.app.use(bodyParser.json())

        this.server = createServer(this.app)
        this.io = new socketIO.Server(this.server, {
            path: '/socket.io',
        })


        this.io.on('connection', (socket) => {
            if(connectors) 
                for(let c of connectors)
                    c.events(socket, this.io)
        })

        this.app.get('*', async (req, res) => {
            res.status(200).send(`No route specified... but hey, I'm working!!`)
        })

        this.server.listen(port)
    }
    
}


export interface Socketable {
    events(socket, io)
}