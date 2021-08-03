const fs = require('fs')
const { exit } = require('process')
const open = require('open')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const createServer = require('http').createServer

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
    let twitch = JSON.parse(''+fs.readFileSync('twitch_credentials.json'))
    let mongo = JSON.parse(''+fs.readFileSync('mongo_credentials.json'))

    let channel = await questionSync(`Enter the twitch channel you'd like to connect the bot to:`)
    if(channel) twitch.channel = channel
    let clientId = await questionSync(`Enter the twitch app clientId (https://dev.twitch.tv/console/apps):`)
    if(clientId) twitch.clientId = clientId
    let clientSecret = await questionSync(`Enter the twitch app clientSecret (https://dev.twitch.tv/console/apps):`)
    if(clientSecret) twitch.clientSecret = clientSecret

    let mUser = await questionSync(`Enter the mongo username:`)
    if(mUser) mongo.connection = mongo.connection.replace(`<USERNAME>`, mUser)
    let mPassword = await questionSync(`Enter the monto password:`)
    if(mPassword) mongo.connection = mongo.connection.replace(`<PASSWORD>`, mPassword)
    let mConnection = await questionSync(`Enter the mongo connection string (everything after the @):`)
    if(mConnection) mongo.connection = mongo.connection.replace(`<CONNECTION_STRING>`, mConnection)

    fs.writeFileSync('twitch_credentials.json', JSON.stringify(twitch, null, 4))
    fs.writeFileSync('mongo_credentials.json', JSON.stringify(mongo, null, 4))
    console.log('\x1b[33m%s\x1b[0m', `Configuration successfully saved.`)
}
let getOauth = async () => {
    return new Promise(async resolve => {


        let twitch = JSON.parse(''+fs.readFileSync('twitch_credentials.json'))
        console.log('\x1b[33m%s\x1b[0m', `Attempting to get access token...`)
        let token = null

        let app = express()
        app.use(cors({
            origin: '*',
            optionsSuccessStatus: 200,
        }))
        app.use(bodyParser.json())

        app.post('/token', async (req,res) => {
            let token = req.body.hash.replace(/\&scope.*$/, '').replace(/^\#access_token=/,'')
            resolve(token)
            res.status(200).send('Done extracting the token')
            server.close()
        })

        app.get('/oauth', async (req,res) => {

            if(req?.query?.code) {
                token = req.query.code
                resolve(token)
            }
            res.status(200).send(`<html><body><h1>Access token retrieved. You can close this tab...</h1></body><script>
            console.log('here')
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:3000/token", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                "hash": window.location.hash
            }));
            </script></html>`)
            //server.close()
        })
        let server = createServer(app)
        server.listen(3000)

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
            &redirect_uri=http://localhost:3000/oauth
            &response_type=token
            &scope=${scopes.join('+')}`
            .replace(/\s/g, '')
        open(oauthString, {app: {name: 'chrome', arguments: ['--incognito']}})

    })
}

let init = async () => {
    console.log(`Initialization process starting...`)
    console.log('\x1b[33m%s\x1b[0m', `Enter 'quit' anytime to cancel the initialization...`)
    console.log('\x1b[33m%s\x1b[0m', `Leave a field empty to just skip it and manually configure it later...`)
    if(fs.existsSync('twitch_credentials.json') || fs.existsSync('mongo_credentials.json')) {
        let answer = await questionSync(`An initialization already exists... Would you like to reinitialize elthabot's credentials? (y/n)`)
        if(/y/gi.test(answer))
            await prepareCredentials()
        else
            console.log('\x1b[33m%s\x1b[0m', `Using existing credentials...`)
    } else {
        fs.copyFileSync('src/assets/twitch_template.json', 'twitch_credentials.json')
        fs.copyFileSync('src/assets/mongo_template.json', 'mongo_credentials.json')
        await prepareCredentials()
    }


    let answer = await questionSync(`Would you like to generate a new oauth? (y/n)`)
    if(/y/gi.test(answer)) {
        answer = await questionSync(`Can the host device open chrome? (y/n)`)
        if(/y/gi.test(answer)) {
            let token = await getOauth()
            if(token) {
                let twitch = JSON.parse(''+fs.readFileSync('twitch_credentials.json'))
                twitch.accessToken = token
                twitch.expiresIn = 60 * 24 * 60 * 60 * 1000
                twitch.obtainmentTimestamp = Date.now()
                twitch.secret = `${twitch.channel}-${Date.now()}` 
                fs.writeFileSync('twitch_credentials.json', JSON.stringify(twitch, null, 4))
                console.log('\x1b[33m%s\x1b[0m', `Access token retrieved and saved...`)
            } else {
                console.log('\x1b[31m%s\x1b[0m','Could not retrieve a token... Please check your credentials...')
            }
        } else {
            console.log('\x1b[33m%s\x1b[0m', `Unfortunately there is no way to get a chat user token without confirming from the browser... You will have to insert your token manually... `)
            let token = await questionSync(`Go to this website (http://twitchapps.com/tmi/), then copy paste the token you get in here:`)
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
            }
        }
    } else
        console.log('\x1b[33m%s\x1b[0m', `Using existing oauth...`)

    answer = await questionSync(`Would you like to setup the endpoint? (y/n)`)
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
    console.log('\x1b[33m%s\x1b[0m', `Initialization process is over... Shutting down...`)
    exit()
}
init()
