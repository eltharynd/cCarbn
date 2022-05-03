import { ApiClient, HelixUser } from "@twurple/api"
import { RefreshingAuthProvider } from "@twurple/auth"
import axios from "axios"
import { UserToken } from "../../db/models/tokens"
import { User } from "../../db/models/user"
import { Mongo } from "../../db/mongo"
import { Socket } from "../../socket/socket"
import { Chat } from "../../twitch/chat"
import { Api } from "../express"
import * as uuid from 'uuid'

export const authMiddleware = async (req, res, next) => {
  let token = req?.headers?.authorization ? req.headers.authorization.replace(/^Basic\s/, '') : null
  if(!token) {
    res.status(403).send('Missing Authorization Header')
    return
  } else {
    let user: any = await User.findOne({token: { $eq: token }})
    if(user) {
      req.headers.authorization = user.toJSON()
      req.headers.authorization._id = req.headers.authorization._id.toString()

      if(!user.admin && req.params.userId && req.params.userId !== req.headers.authorization._id) {
        res.status(403).send(`You don't have permission to access this resource...`)
        return
      }
      next()
    }
  }
}
export class AuthRoutes {

  static attach() {

    Api.endpoints.post('/api/auth/token', async (req, res) => {
      if(!req.body.code || !req.body.redirect || !req.body.state) {
        res.status(400).send('Invalid Request')
        return
      }
      try {
        let response = await axios.post(`
          https://id.twitch.tv/oauth2/token
          ?client_id=${Mongo.clientId}
          &client_secret=${Mongo.clientSecret}
          &code=${req.body.code}
          &grant_type=authorization_code
          &state=${req.body.state}
          &redirect_uri=${req.body.redirect}`.replace(/\s/g, ''))
        if(!response.data)
          throw new Error()

        let token: any = {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token,
          expiresIn: response.data.expires_in,
          obtainmentTimestamp: Date.now()
        }
      
        let userProvider = new RefreshingAuthProvider(
          {
            clientId: Mongo.clientId,
            clientSecret: Mongo.clientSecret,
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
          twitchName: tokenInfo.userName,
        }
        let registered: any = await User.findOne({ twitchId: user.twitchId })
        if(!registered) {

          let helixUser: HelixUser = await twitch.users.getUserById(user.twitchId)
          if(helixUser) {
            user.twitchPic = helixUser.profilePictureUrl
            user.twitchName = helixUser.name
            user.twitchDisplayName = helixUser.displayName
          }


          registered = new User(user)
          registered.token = `${uuid.v4()}`
          registered.lastLogin = new Date()
          await registered.save()
          token.userId = registered._id
          let userToken = new UserToken(token)
          await userToken.save()
        } else {
          let helixUser: HelixUser = await twitch.users.getUserById(user.twitchId)
          if(helixUser) {
            registered.twitchPic = helixUser.profilePictureUrl
            registered.twitchName = helixUser.name
            registered.twitchDisplayName = helixUser.displayName
            registered.lastLogin = new Date()
            await registered.save()
          }

          let found = await UserToken.findOne({userId: registered._id})
          if(found) {
            token.userId = registered._id
            found.overwrite(token)
            await found.save()
          } else {
            token.userId = registered._id
            let userToken = new UserToken(token)
            await userToken.save()
          }
        }
        

        Socket.io.emit(req.body.state, {
          _id: registered._id,
          name: registered.twitchDisplayName,
          founder: registered.founder,
          supporter: registered.supporter,
          premium: registered.premium,
          token: registered.token,
          picture: registered.twitchPic
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

      let registered: any = await User.findOne({token: { $eq: req.body.token }})
      if(!registered) 
        res.status(401).send('Could not resume session...')
      else {
        let twitch = new ApiClient({
          authProvider: Chat.defaultUserProvider
        })   
        let helixUser: HelixUser = await twitch.users.getUserById(registered.twitchId)
        if(helixUser) {
          registered.twitchPic = helixUser.profilePictureUrl
          registered.twitchName = helixUser.name
          registered.twitchDisplayName = helixUser.displayName
          registered.lastLogin = new Date()
          await registered.save()
        }    
        res.send({
          _id: registered._id,
          name: registered.twitchDisplayName,
          founder: registered.founder,
          supporter: registered.supporter,
          premium: registered.premium,
          token: registered.token,
          picture: registered.twitchPic
        })
      }
    })
  }

}