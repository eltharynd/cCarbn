import { ApiClient } from "@twurple/api"
import { RefreshingAuthProvider } from "@twurple/auth"
import axios from "axios"
import { CREDENTIALS } from "../.."
import { User } from "../../db/models/user"
import { Socket } from "../../socket/socket"
import { Api } from "../express"


export class Auth {

  static bind() {

    Api.endpoints.post('/api/auth/token', async (req, res) => {
      if(!req.body.code || !req.body.redirect || !req.body.state) {
        res.status(400).send('Invalid Request')
        return
      }
      try {
        let response = await axios.post(`
          https://id.twitch.tv/oauth2/token
          ?client_id=${CREDENTIALS.clientId}
          &client_secret=${CREDENTIALS.clientSecret}
          &code=${req.body.code}
          &grant_type=authorization_code
          &state=${req.body.state}
          &redirect_uri=${req.body.redirect}`.replace(/\s/g, ''))
        if(!response.data)
          throw new Error()

        let token = {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: response.data.expires_in,
          obtainmentTimestamp: Date.now()
       }
      
        let userProvider = new RefreshingAuthProvider(
          {
            clientId: CREDENTIALS.clientId,
            clientSecret: CREDENTIALS.clientSecret,
            onRefresh: (token) => {},
          },
          token
        )
        let twitch = new ApiClient({
          authProvider: userProvider
        })    
        let tokenInfo = await twitch.getTokenInfo()

        let user: any = {
          twitchId: tokenInfo.userId,
          twitchName: tokenInfo.userName
        }
        let registered: any = await User.findOne({ twitchId: user.twitchId })
        if(!registered) {
          registered = new User(user)
          registered.save()
        }

        Socket.io.emit(req.body.state, {
          name: registered.twitchName,
          token: registered.token
        })
        res.send('token saved')
      } catch (err) {
        console.error(err)
        Socket.io.emit(req.body.state, err)
        res.status(500).send('Could not verify authentication code with twitch')
      }
    })

    Api.endpoints.post('/api/auth/resume', async (req, res) => {
      let user = req.body
      if(!user) {
        res.status(400).send('Bad Request')
        return
      }
      res.send(user)
    })
  }

}