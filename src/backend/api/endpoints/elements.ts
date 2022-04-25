import { Elements } from "../../db/models/elements"
import { Api } from "../express"
import { authMiddleware } from "./auth"
import { Mongo } from "../../db/mongo"
import { filter, from, retryWhen, take } from "rxjs"
const uuid = require('uuid')

export class ElementsRoutes {

  static attach() {

    Api.endpoints.route('/api/elements/:userId')
      .get(async (req, res) => {
        let elements: any = await Elements.findOne({ userId: Mongo.ObjectId(req.params.userId) })
        if(!elements) {
          elements = await Elements.create({ userId: Mongo.ObjectId(req.params.userId), json: [] })
          await elements.save()
        }
        res.send(elements.json)
      })
      .post(authMiddleware, async (req,res) => {
        let element = req.body
        
        let userElements: any = await Elements.findOne({ userId: Mongo.ObjectId(req.params.userId) })
        if(!userElements) userElements = await Elements.create({ userId: Mongo.ObjectId(req.params.userId), json: []})
        let elements = userElements.json
        
        let found
        if(element._id) {
          found = await from(elements).pipe(
            filter((e: any) => e._id === element._id),
            take(1)
          ).toPromise()
        } 

        if(found) {
          element._id = found._id ? found._id : uuid.v4()
          elements[elements.indexOf(found)] = element
        } else {
          element._id = uuid.v4()
          elements.push(element)
        }
        userElements.json = elements
        await userElements.save()
        res.send(element._id)
      })
    Api.endpoints.route('/api/elements/:userId/:elementId')
      .delete(authMiddleware, async (req,res) => {
        let userElements: any = await Elements.findOne({ userId: Mongo.ObjectId(req.params.userId) })
        if(!userElements) userElements = await Elements.create({ userId: Mongo.ObjectId(req.params.userId), json: []})
        let elements = userElements.json
      
        let found
        for(let e of elements) {
          if(e._id === req.params.elementId) {
            found = e
            break
          }
        }  

        let removed = elements.splice(elements.indexOf(found), 1)
        userElements.json = elements
        await userElements.save()
        res.send()

        if(removed.length>0)
          for(let event of removed[0].events) {
            if(event.src) {
              let fileName = event.src.replace(/^.+\//g, '')
              await Api.unlink(fileName, req.params.userId)
            }
          }
      })
  }

}