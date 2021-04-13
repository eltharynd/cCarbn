import * as tmi from 'tmi.js'
import * as fs from 'fs'

import { Common } from './message/common'
import { Everyone } from './message/Everyone'
import { Moderators } from './message/Moderators'
import { Twitch } from './hooks/twitch'

export const CREDENTIALS = JSON.parse(''+fs.readFileSync('twitch_credentials.json'))
export const MONGO = JSON.parse(''+fs.readFileSync('mongo_credentials.json')).connection

const client = new tmi.Client({
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
    ]
})

client.connect().then((value) => {
    console.log(`connected: ${value}`)

    Twitch.init()

    new Common(client)
    new Everyone(client)
    new Moderators(client)

}).catch((reason) => {
    console.log(`Could not connect to twitch chat for reason: ${reason}`)
})

