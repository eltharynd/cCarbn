const fs = require('fs')
const { exit } = require('process')
import { RefreshingAuthProvider } from '@twurple/auth'
import { ApiClient } from '@twurple/api'
import { resolve } from 'dns'
import * as Mongoose from 'mongoose'
import * as open from 'open'

import { Administrator } from './src/backend/db/models/user'
import { DefaultUserToken , DefaultClientToken } from './src/backend/db/models/tokens'

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const createServer = require('http').createServer
const { default: axios } = require('axios')
const uuid = require('uuid')

const rl = (require('readline')).createInterface({
    input: process.stdin,
    output: process.stdout
})
function questionSync(query) {
    return new Promise(resolve => {
        console.log('\x1b[36m')
        rl.question(query+'\n', ans => {
            if(/^quit$/.test(ans)) {console.log('\x1b[31m%s\x1b[0m','Initialization process ended by user...'); exit() }
            resolve(ans)
        })
    })
}


let prepareCredentials = async () => {
    let twitch
    try {
        twitch = JSON.parse(''+fs.readFileSync('twitch_credentials.json'))
    } catch (e) {
        fs.copyFileSync('src/assets/twitch_template.json', 'twitch_credentials.json')
        twitch = JSON.parse(''+fs.readFileSync('twitch_credentials.json'))
    }
    let mongo
    try {
        mongo = JSON.parse(''+fs.readFileSync('mongo_credentials.json'))
    } catch (e) {
        fs.copyFileSync('src/assets/mongo_template.json', 'mongo_credentials.json')
        mongo = JSON.parse(''+fs.readFileSync('mongo_credentials.json'))
    }


    let clientId = await questionSync(`Enter the twitch app clientId (https://dev.twitch.tv/console/apps):`)
    if(clientId) twitch.clientId = clientId
    let clientSecret = await questionSync(`Enter the twitch app clientSecret (https://dev.twitch.tv/console/apps):`)
    if(clientSecret) twitch.clientSecret = clientSecret

    let mConnection = await questionSync(`Enter the mongo connection string:`)
    if(mConnection) mongo.connection = mConnection

    fs.writeFileSync('twitch_credentials.json', JSON.stringify(twitch, null, 4))
    fs.writeFileSync('mongo_credentials.json', JSON.stringify(mongo, null, 4))
    console.log('\x1b[33m%s\x1b[0m', `Configuration successfully saved.`)
}
let getOauth = async () => {
    return new Promise(async resolve => {


        let twitch = JSON.parse(''+fs.readFileSync('twitch_credentials.json'))
        console.log('\x1b[33m%s\x1b[0m', `Attempting to get access token...`)
        let app = express()
        app.use(cors({
            origin: '*',
            optionsSuccessStatus: 200,
        }))
        app.use(bodyParser.json())

        app.get('/auth/token', async (req,res) => {
            let code = req?.query?.code
            let response = await axios.post(`
                https://id.twitch.tv/oauth2/token
                ?client_id=${twitch.clientId}
                &client_secret=${twitch.clientSecret}
                &code=${code}
                &grant_type=authorization_code
                &redirect_uri=http://localhost:4200/auth/token`.replace(/\s/g, ''))
            resolve(response.data)
            res.status(200).send('Done extracting the token')
            server.close()
        })

        let server = createServer(app)
        server.listen(4200)

        let scopes = [
          'bits:read',
          'channel:edit:commercial',
          'channel:manage:broadcast',
          'channel:manage:polls',
          'channel:manage:predictions',
          'channel:manage:redemptions',
          'channel:manage:schedule',
          'channel:read:hype_train',
          'channel:read:polls',
          'channel:read:predictions',
          'channel:read:redemptions',
          'channel:read:subscriptions',
          'clips:edit',
          'moderation:read',
          'user:edit',
          'user:manage:blocked_users',
          'user:read:blocked_users',
          'user:read:broadcast',
          'user:read:follows',
          'user:read:subscriptions',
          'channel:moderate',
          'chat:edit',
          'chat:read',
          'whispers:read',
          'whispers:edit'
        ]
        let oauthString =
            `https://id.twitch.tv/oauth2/authorize
            ?client_id=${twitch.clientId}
            &redirect_uri=http://localhost:4200/auth/token
            &response_type=code
            &force_verify=true
            &scope=${scopes.join('+')}`
            .replace(/\s/g, '')
        open(oauthString, {app: {name: 'chrome'}})

    })
}

let init = async () => {
    console.log(`Initialization process starting...`)
    console.log('\x1b[33m%s\x1b[0m', `Enter 'quit' anytime to cancel the initialization...`)
    console.log('\x1b[33m%s\x1b[0m', `Leave a field empty to just skip it and manually configure it later...`)
    if(fs.existsSync('twitch_credentials.json') || fs.existsSync('mongo_credentials.json')) {
        let answer: any = await questionSync(`An initialization already exists... Would you like to reinitialize elthabot's credentials? (y/n)`)
        if(/y/gi.test(answer))
            await prepareCredentials()
        else
            console.log('\x1b[33m%s\x1b[0m', `Using existing credentials...`)
    } else {
        fs.copyFileSync('src/assets/twitch_template.json', 'twitch_credentials.json')
        fs.copyFileSync('src/assets/mongo_template.json', 'mongo_credentials.json')
        await prepareCredentials()
    }

    let answer: any = await questionSync(`Would you like to setup domain and certificates? (y/n)`)
    if(/y/gi.test(answer)) {
      if(fs.existsSync('endpoint_credentials.json')) {
        answer = await questionSync(`An initialization already exists... Would you like to reinitialize it? (y/n)`)
        if(/y/gi.test(answer))
          fs.copyFileSync('src/assets/endpoint_template.json', 'endpoint_credentials.json')
      } else
        fs.copyFileSync('src/assets/endpoint_template.json', 'endpoint_credentials.json')

      let endpoint = JSON.parse(''+fs.readFileSync('endpoint_credentials.json'))
      let hostname = await questionSync(`Enter the hostname for the client listener:`)
      if(hostname) endpoint.hostname = hostname
      let crt = await questionSync(`Enter the path to the SSL certificate:`)
      if(crt) endpoint.crt = crt
      let key = await questionSync(`Enter the path to the SSL key:`)
      if(key) endpoint.key = key
      fs.writeFileSync('endpoint_credentials.json', JSON.stringify(endpoint, null, 4))
      console.log('\x1b[33m%s\x1b[0m', `Endpoint configuration successfully saved.`)
    } else {
      console.log('\x1b[33m%s\x1b[0m', `Using existing endpoint config...`)
    }


    answer = await questionSync(`Would you like to generate a new oauth? (y/n)`)
    if(/y/gi.test(answer)) {
        answer = await questionSync(`Can the host device open chrome? (y/n)`)
        if(/y/gi.test(answer)) {
            let data: any = await getOauth()
            if(data) {

                let twitch: any = JSON.parse(''+fs.readFileSync('twitch_credentials.json'))
                let mongo: any = JSON.parse(''+fs.readFileSync('mongo_credentials.json'))
    
                let token: any = {
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    expiresIn: data.expires_in,
                    obtainmentTimestamp: Date.now(),
                    secret: uuid.v4()
                }

                
                
                let connected = await new Promise((resolve) => {
                    Mongoose.connect(mongo.connection, { useNewUrlParser: true, useUnifiedTopology: true })
                    Mongoose.connection.on('error', (error) => {console.error(error);resolve(false)})
                    Mongoose.connection.once('open', () => resolve(true))
                })
                if(connected) {

                    let userProvider = new RefreshingAuthProvider(
                        {
                          clientId: twitch.clientId,
                          clientSecret: twitch.clientSecret,
                          onRefresh: (token) => {},
                        },
                        token
                      )
                      let client = new ApiClient({
                        authProvider: userProvider
                      })    
                      let tokenInfo = await client.getTokenInfo()
                      let user: any = {
                        twitchId: tokenInfo.userId,
                        twitchName: tokenInfo.userName
                      }
                      await Administrator.deleteMany()

                      let registered: any = await Administrator.findOne({ twitchId: user.twitchId })
                      if(!registered) {
                        registered = new Administrator(user)
                        await registered.save()
                      }
                      token.userId = registered._id
                      await DefaultUserToken.deleteMany()
                      let defaultUserToken = new DefaultUserToken(token)
                      await defaultUserToken.save()
                      await DefaultClientToken.deleteMany()
                      let defaultClientToken = new DefaultClientToken({
                          userId: token.userId,
                          clientId: twitch.clientId,
                          clientSecret: twitch.clientSecret
                      })
                      await defaultClientToken.save()

                      console.log('\x1b[33m%s\x1b[0m', `Tokens saved to mongodb...`)

                      answer = await questionSync(`Do you wanna delete the twitch_credentials.json file? (y/n)`)
                      if(/y/gi.test(answer)) {
                        fs.unlinkSync('twitch_credentials.json')
                        console.log('\x1b[33m%s\x1b[0m', `Deleted twitch_credentials.json...`)
                      }
                      
                } else 
                    console.log('\x1b[31m%s\x1b[0m','Could not connect to mongodb... Please check your credentials...')   
            } else 
                console.log('\x1b[31m%s\x1b[0m','Could not retrieve a token... Please check your credentials...')
        } else {
            console.log('\x1b[33m%s\x1b[0m', `Unfortunately there is no way to get a chat user token without confirming from the browser... You will have to upload your token manually... `)
            /* let token = await questionSync(`Go to this website (http://twitchapps.com/tmi/), then copy paste the token you get in here:`)
            if(!token || !/^oauth\:/.test(token)) {
                console.log('\x1b[31m%s\x1b[0m','Token provided is invalid... Shutting down...')
                exit()
            } else {
                let twitch = JSON.parse(''+fs.readFileSync('twitch_credentials.json'))
                twitch.accessToken = token.replace(/^oauth\:/, '')
                twitch.expiresIn = 60 * 24 * 60 * 60 * 1000
                twitch.obtainmentTimestamp = Date.now()
                fs.writeFileSync('twitch_credentials.json', JSON.stringify(twitch, null, 4))
                console.log('\x1b[33m%s\x1b[0m', `Access token saved...`)
            } */
        }
    } else
        console.log('\x1b[33m%s\x1b[0m', `Using existing oauth...`)

    
    console.log('\x1b[33m%s\x1b[0m', `Initialization process is over... Shutting down...`)
    exit()
}
init()
