//import * as tmi from 'tmi.js'
import * as tmi from 'twitch-auth-tmi'
import { StaticAuthProvider, RefreshableAuthProvider } from 'twitch-auth'
import * as fs from 'fs'
import { auth } from 'twitch-api-v5'

import { Common } from './message/common'
import { Everyone } from './message/Everyone'
import { Moderators } from './message/Moderators'
import { Twitch } from './hooks/twitch'
import { Socket } from './hooks/socket'
import { Mongo } from './db/mongo'

export const PORT = 3000
export const CREDENTIALS= JSON.parse(''+fs.readFileSync('twitch_credentials.json'))
export const MONGO = JSON.parse(''+fs.readFileSync('mongo_credentials.json'))
const authProvider = new RefreshableAuthProvider(new StaticAuthProvider(CREDENTIALS.clientID, CREDENTIALS.oauth), {
    clientSecret: CREDENTIALS.secret,
    refreshToken: CREDENTIALS.oauth,
    expiry: CREDENTIALS.expiration? new Date(CREDENTIALS.expiration) : null,
    onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
        let newCredentials = Object.assign(CREDENTIALS, {})
        newCredentials.oauth = accessToken
        newCredentials.refreshToken = refreshToken
        newCredentials.expiration = expiryDate.getTime()
        await fs.writeFileSync('twitch_credentials.json', JSON.stringify(newCredentials, null, 4))
    }
}) 

const client: any = new tmi.Client({
    options: {
        debug: true,
        messagesLogLevel: 'info',
    },
    connection: {
        reconnect: true,
        secure: true
    },
    authProvider: authProvider,
    channels: [
        CREDENTIALS.channel,
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
    //console.log(reason)
    console.log(`Could not connect to twitch chat for reason: ${reason}`)
    //let oauthSocket = new Socket(3000)
})

