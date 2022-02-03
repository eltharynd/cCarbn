import { HelixUser } from "@twurple/api/lib"
import { User as MongoUser, deleteUser } from "../../db/models/user"
import { Settings } from "../../db/models/settings"
import { Category, Chat } from "../../twitch/chat"
import { Listeners, Twitch } from "../../twitch/twitch"
import { Api } from "../express"
import { authMiddleware } from "./auth"
import { Mongo } from "../../db/mongo"
import * as merge from 'deepmerge'

export class User {

  static bind() {

    Api.endpoints.delete('/api/user/:userId', authMiddleware, async (req, res) => {
      if(req.params.userId.length>10) {
        await deleteUser(req.params.userId)
        res.send({})
      } else {
        res.status(404).send({})
      }
    })

    Api.endpoints.get('/api/user/:userId/picture', async (req, res) => {
      if(req.params.userId.length>10) {
        let found: any = await MongoUser.findById(Mongo.ObjectId(req.params.userId))
        if(found) {
          let helixUser: HelixUser = await Twitch.client.users.getUserById(found.twitchId)
          if(helixUser) {
            res.send(helixUser.profilePictureUrl)
            return
          }          
        }
      } else {
        let helixUser: HelixUser = await Twitch.client.users.getUserById(req.params.userId)
        if(helixUser) {
          res.send(helixUser.profilePictureUrl)
          return
        }       
      }
      res.status(404).send({})
    })


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

    Api.endpoints.post('/api/user/:userId/settings/api/listener/:listener/enable', authMiddleware, async (req, res) => {
      //@ts-ignore
      let settings: any = await Settings.findOne({userId: req.headers.authorization._id})
      let json = settings.json
      json.api.listeners[req.params.listener] = merge(json.api.listeners[req.params.listener], { enabled: true })
      settings.json = json
      //@ts-ignore
      await Twitch.toggleListener(await Twitch.client.users.getUserById(req.headers.authorization.twitchId), Listeners[req.params.listener], true, json) 
      await settings.save()
      res.send(settings.json)
    })
    Api.endpoints.delete('/api/user/:userId/settings/api/listener/:listener/disable', authMiddleware, async (req, res) => {
      //@ts-ignore
      let settings: any = await Settings.findOne({userId: req.headers.authorization._id})
      let json = settings.json
      json.api.listeners[req.params.listener] = merge(json.api.listeners[req.params.listener], { enabled: false })
      settings.json = json
      //@ts-ignore
      await Twitch.toggleListener(await Twitch.client.users.getUserById(req.headers.authorization.twitchId), Listeners[req.params.listener], false, json)
      await settings.save()
      res.send(settings.json)
    })

    Api.endpoints.get('/api/user/:userId/settings/api/listener/:listener', async (req, res) => {
      let found: any = await Settings.findOne({userId: req.params.userId})
      if(!found) {
        found = new Settings({userId: req.params.userId})
        await found.save()
      }
      res.send(found.json.api.listeners[req.params.listener])
    })
    Api.endpoints.post('/api/user/:userId/settings/api/listener/:listener', authMiddleware, async (req, res) => {
      let found: any = await Settings.findOne({userId: req.params.userId})
      if(!found || !req.body) {
        res.status(400).send()
        return
      }
      let buffer = {
        api: {
          listeners: {}
        }
      }
      buffer.api.listeners[req.params.listener] = req.body
      found.json = merge(found.json, buffer)
      await found.save()
      res.send(found.json.api.listeners[req.params.listener])
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

    Api.endpoints.post('/api/user/:userId/settings/chatbot/category/:category/enable', authMiddleware, async (req, res) => {
      //@ts-ignore
      let settings: any = await Settings.findOne({userId: req.headers.authorization._id})
      let json = settings.json
      json.chatbot.categories[req.params.category] = merge(json.chatbot.categories[req.params.category], { enabled: true })
      settings.json = json
      await Chat.toggleCategory(req.headers.authorization, Category[req.params.category], true, json) 
      await settings.save()
      res.send(settings.json)
    })
    Api.endpoints.delete('/api/user/:userId/settings/chatbot/category/:category/disable', authMiddleware, async (req, res) => {
      //@ts-ignore
      let settings: any = await Settings.findOne({userId: req.headers.authorization._id})
      let json = settings.json
      json.chatbot.categories[req.params.category] = merge(json.chatbot.categories[req.params.category], { enabled: false })
      settings.json = json
      await Chat.toggleCategory(req.headers.authorization, Category[req.params.category], false, json)
      await settings.save()
      res.send(settings.json)
    })



  }

}