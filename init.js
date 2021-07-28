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
    let clientID = await questionSync(`Enter the twitch app clientID (https://dev.twitch.tv/console/apps):`)
    if(clientID) twitch.clientID = clientID
    let secret = await questionSync(`Enter the twitch app secret (https://dev.twitch.tv/console/apps):`)
    if(secret) twitch.secret = secret

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

        let oauthString =
            `https://id.twitch.tv/oauth2/authorize
            ?client_id=${twitch.clientID}
            &redirect_uri=http://localhost:3000/oauth
            &response_type=token
            &scope=chat:read+chat:edit+channel:moderate+whispers:read+whispers:edit+channel_editor`
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
                twitch.oauth = token
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
                twitch.oauth = token.replace(/^oauth\:/, '')
                fs.writeFileSync('twitch_credentials.json', JSON.stringify(twitch, null, 4))
                console.log('\x1b[33m%s\x1b[0m', `Access token saved...`)
            }
        }
    } else
        console.log('\x1b[33m%s\x1b[0m', `Using existing oauth...`)
    console.log('\x1b[33m%s\x1b[0m', `Initialization process is over... Shutting down...`)
    exit()
}
init()
