import * as tmi from 'tmi.js'
import * as fs from 'fs'
import { auth } from 'twitch-api-v5'

import { Common } from './message/common'
import { Everyone } from './message/Everyone'
import { Moderators } from './message/Moderators'
import { Twitch } from './hooks/twitch'
import { Socket } from './hooks/socket'
import { BPM } from './hooks/bpm'
import { Mongo } from './db/mongo'

export const CREDENTIALS = JSON.parse(''+fs.readFileSync('twitch_credentials.json'))
export const MONGO = JSON.parse(''+fs.readFileSync('mongo_credentials.json')).connection

const client: any = new tmi.Client({
    options: {
        debug: true,
        messagesLogLevel: 'info',
        clientId: CREDENTIALS.clientID
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity:  {
        username: CREDENTIALS.username,
        password: `oauth:${CREDENTIALS.oauth}`
        //http://twitchapps.com/tmi/
    },
    channels: [
        CREDENTIALS.channel, 
        /* 'terfiel', */
        /* 'leydybug', */
        /* 'soldi', */
        /* 'trashnutt',  */
        /* 'cederic_drachenreign', */ 
        /* 'cakeums', */
        /* 'jf0rce', */
        /* 'gottablast', */
        /* 'killakayttv', */
        /* 'godgamerkate', */
        /* 'ainrun', */
    ]
})

client.connect().then((value) => {
    console.log(`connected: ${value}`)

    Twitch.init()

    new Common(client)
    new Everyone(client)
    new Moderators(client)

    //let bpm = new BPM()
    let socket =  new Socket(3000, [/* bpm */])
    client.socket = socket.io

    new Mongo()

    

}).catch((reason) => {
    console.log(`Could not connect to twitch chat for reason: ${reason}`)
})

