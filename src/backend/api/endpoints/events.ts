import { Events as MongoEvents } from "../../db/models/events"
import { Api } from "../express"
import { authMiddleware } from "./auth"
import { Mongo } from "../../db/mongo"
import { filter, from, retryWhen, take } from "rxjs"
const uuid = require('uuid')

export class Events {

  static attach() {

    Api.endpoints.route('/api/events/:userId')
      .get(async (req, res) => {
        let events: any = await MongoEvents.findOne({ userId: Mongo.ObjectId(req.params.userId) })
        if(!events) {
          events = await MongoEvents.create({ userId: Mongo.ObjectId(req.params.userId), json: [] })
          await events.save()
        }
        res.send(events.json)
      })
      .post(authMiddleware, async (req,res) => {
        let event = req.body
        
        let userEvents: any = await MongoEvents.findOne({ userId: Mongo.ObjectId(req.params.userId) })
        if(!userEvents) userEvents = await MongoEvents.create({ userId: Mongo.ObjectId(req.params.userId), json: []})
        let events = userEvents.json
        
        let found
        if(event._id) {
          found = await from(events).pipe(
            filter((e: any) => e._id === event._id),
            take(1)
          ).toPromise()
        } 

        if(found) {
          event._id = found._id ? found._id : uuid.v4()
          found = event
        } else {
          event._id = uuid.v4()
          events.push(event)
        }
        userEvents.json = events
        await userEvents.save()
        res.send(event._id)
      })
    Api.endpoints.route('/api/events/:userId/:eventId')
      .delete(authMiddleware, async (req,res) => {
        let userEvents: any = await MongoEvents.findOne({ userId: Mongo.ObjectId(req.params.userId) })
        if(!userEvents) userEvents = await MongoEvents.create({ userId: Mongo.ObjectId(req.params.userId), json: []})
        let events = userEvents.json
      
        let found
        for(let e of events) {
          if(e._id === req.params.eventId) {
            found = e
            break
          }
        }  

        let removed = events.splice(events.indexOf(found), 1)
        userEvents.json = events
        await userEvents.save()
        res.send()

        if(removed.length>0)
          for(let e of removed[0].events) {
            if(e.src) {
              let fileName = e.src.replace(/^.+\//g, '')
              await Api.unlink(fileName, req.params.userId)
            }
          }
      })
  }

}