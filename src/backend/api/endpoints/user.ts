import { Settings } from "../../db/models/settings"
import { Chat } from "../../twitch/chat"
import { Twitch } from "../../twitch/twitch"
import { Api } from "../express"
import { authMiddleware } from "./auth"

export class User {

  static bind() {

    Api.endpoints.get('/api/user/:userId/settings', authMiddleware,  async (req, res) => {
      let found: any = await Settings.findOne({userId: req.params.userId})
      res.send(found ? found.json : {})
    })

    Api.endpoints.post('/api/user/:userId/settings', authMiddleware,  async (req, res) => {
      let found: any = await Settings.findOne({userId: req.params.userId}) 
      if(!found) {
        found = new Settings({userId: req.params.userId, json: req.body})
        await found.save()
      } else {
        await found.overwrite({userId: req.params.userId, json: req.body})
        await found.save()
      }
      res.send(found.json)
    })

    Api.endpoints.get('/api/user/:userId/settings/chatbot/:action', authMiddleware,  async (req, res) => {
      try {

        if(req.params.action === 'enable') {
          Chat.connect(req.headers.authorization)
        } else 
          Chat.disconnect(req.headers.authorization)
        
        res.send({})

      } catch(e) {
        res.status(500).send('Internal server error')
      }
    })

    Api.endpoints.get('/api/user/:userId/settings/api/:action', authMiddleware,  async (req, res) => {
      try {

        if(req.params.action === 'enable') {
          Twitch.connect(req.headers.authorization)
        } else 
          Twitch.disconnect(req.headers.authorization)
        
        res.send({})

      } catch(e) {
        res.status(500).send('Internal server error')
      }
    })

  }

}