import { Settings } from "../../db/models/settings"
import { Chat } from "../../twitch/chat"
import { Twitch } from "../../twitch/twitch"
import { Api } from "../express"
import { authMiddleware } from "./auth"

export class User {

  static bind() {

    Api.endpoints.get('/api/user/:userId/settings', authMiddleware,  async (req, res) => {
      let found: any = await Settings.findOne({userId: req.params.userId})
      if(!found) {
        found = new Settings({userId: req.params.userId})
        await found.save()
      }
      res.send(found.json)
    })

    Api.endpoints.post('/api/user/:userId/settings', authMiddleware,  async (req, res) => {
      let found: any = await Settings.findOne({userId: req.params.userId}) 
      if(!found) {
        found = new Settings({userId: req.params.userId, json: req.body})
        await found.save()
      } else {
        await found.overwrite({userId: req.params.userId, json: Object.assign(found.json, req.body)})
        await found.save()
      }
      res.send(found.json)
    })


    Api.endpoints.get('/api/user/:userId/settings/api/:action', authMiddleware,  async (req, res) => {
      try {

        if(req.params.action === 'enable') {
          await Twitch.connect(req.headers.authorization)
        } else 
          await Twitch.disconnect(req.headers.authorization)
        
        let settings: any = await Settings.findOne({userId: req.params.userId})
        console.log(settings)
        let json = settings.json
        json.api.enabled = req.params.action === 'enable'
        settings.json = json
        await settings.save()

        res.send(settings.json)

      } catch(e) {
        console.error(e)
        res.status(500).send('Internal server error')
      }
    })

    Api.endpoints.get('/api/user/:userId/settings/chatbot/:action', authMiddleware,  async (req, res) => {
      try {

        if(req.params.action === 'enable') {
          await Chat.connect(req.headers.authorization)
        } else 
          await Chat.disconnect(req.headers.authorization)
        
        let settings: any = await Settings.findOne({userId: req.params.userId})
        let json = settings.json
        json.chatbot.enabled = req.params.action === 'enable'
        settings.json = json
        await settings.save()

        res.send(settings.json)

      } catch(e) {
        console.error(e)
        res.status(500).send('Internal server error')
      }
    })

  }

}