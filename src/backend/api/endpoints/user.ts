import { Settings } from "../../db/models/settings"
import { Category, Chat } from "../../twitch/chat"
import { Listeners, Twitch } from "../../twitch/twitch"
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
      let settings: any = await Settings.findOne({userId: req.params.userId})
      let json = settings.json

      if(req.params.action === 'enable') {
        json.api.enabled = true
        await Twitch.connect(req.headers.authorization, json)
      } else {
        json.api.enabled = false
        await Twitch.disconnect(req.headers.authorization, json)
      }

      settings.json = json
      await settings.save()

      res.send(settings.json)
    })

    Api.endpoints.get('/api/user/:userId/settings/chatbot/:action', authMiddleware,  async (req, res, next) => {
      let settings: any = await Settings.findOne({userId: req.params.userId})
      let json = settings.json

      if(req.params.action === 'enable') {
        json.chatbot.enabled = true
        await Chat.connect(req.headers.authorization, json)
      } else {
        json.chatbot.enabled = false
        await Chat.disconnect(req.headers.authorization, json)
      }
      
      settings.json = json
      await settings.save()

      res.send(settings.json)
    })

    Api.endpoints.post('/api/user/:userId/settings/chatbot/category/:category', authMiddleware, async (req, res) => {
      //@ts-ignore
      let settings: any = await Settings.findOne({userId: req.headers.authorization._id})
      let json = settings.json
      json.chatbot.categories[req.params.category] = true
      settings.json = json
      await Chat.toggleCategory(req.headers.authorization, Category[req.params.category], true, json) 
      await settings.save()
      res.send(settings.json)
    })

    Api.endpoints.delete('/api/user/:userId/settings/chatbot/category/:category', authMiddleware, async (req, res) => {
      //@ts-ignore
      let settings: any = await Settings.findOne({userId: req.headers.authorization._id})
      let json = settings.json
      json.chatbot.categories[req.params.category] = false
      settings.json = json
      await Chat.toggleCategory(req.headers.authorization, Category[req.params.category], false, json)
      await settings.save()
      res.send(settings.json)
    })



    Api.endpoints.post('/api/user/:userId/settings/api/listener/:listener', authMiddleware, async (req, res) => {
      //@ts-ignore
      let settings: any = await Settings.findOne({userId: req.headers.authorization._id})
      let json = settings.json
      json.api.listeners[req.params.listener] = true
      settings.json = json
      //@ts-ignore
      await Twitch.toggleListener(await Twitch.client.users.getUserById(req.headers.authorization.twitchId), Listeners[req.params.listener], true, json) 
      await settings.save()
      res.send(settings.json)
    })

    Api.endpoints.delete('/api/user/:userId/settings/api/listener/:listener', authMiddleware, async (req, res) => {
      //@ts-ignore
      let settings: any = await Settings.findOne({userId: req.headers.authorization._id})
      let json = settings.json
      json.api.listeners[req.params.listener] = false
      settings.json = json
      //@ts-ignore
      await Twitch.toggleListener(await Twitch.client.users.getUserById(req.headers.authorization.twitchId), Listeners[req.params.listener], false, json)
      await settings.save()
      res.send(settings.json)
    })
  }

}