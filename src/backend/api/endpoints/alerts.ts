import { Alerts } from "../../db/models/alerts"
import { Api } from "../express"
import { authMiddleware } from "./auth"
import { Mongo } from "../../db/mongo"
import { filter, from, retryWhen, take } from "rxjs"
const uuid = require('uuid')

export class AlertsRoutes {

  static attach() {

    Api.endpoints.route('/api/alerts/:userId')
      .get(async (req, res) => {
        let alerts: any = await Alerts.findOne({ userId: Mongo.ObjectId(req.params.userId) })
        if(!alerts) {
          alerts = await Alerts.create({ userId: Mongo.ObjectId(req.params.userId), alerts: [] })
          await alerts.save()
        }
        res.send(alerts.alerts)
      })
      .post(authMiddleware, async (req,res) => {
        let alert = req.body
        
        let userAlerts: any = await Alerts.findOne({ userId: Mongo.ObjectId(req.params.userId) })
        if(!userAlerts) userAlerts = await Alerts.create({ userId: Mongo.ObjectId(req.params.userId), alerts: []})
        let alerts = userAlerts.alerts
        
        let found
        if(alert._id) {
          found = await from(alerts).pipe(
            filter((e: any) => e._id === alert._id),
            take(1)
          ).toPromise()
        } 

        if(found) {
          alert._id = found._id ? found._id : uuid.v4()
          alerts[alerts.indexOf(found)] = alert
        } else {
          alert._id = uuid.v4()
          alerts.push(alert)
        }
        userAlerts.alerts = alerts
        await userAlerts.save()
        res.send(alert._id)
      })
    Api.endpoints.route('/api/alerts/:userId/:alertId')
      .delete(authMiddleware, async (req,res) => {
        let userAlerts: any = await Alerts.findOne({ userId: Mongo.ObjectId(req.params.userId) })
        if(!userAlerts) userAlerts = await Alerts.create({ userId: Mongo.ObjectId(req.params.userId), alerts: []})
        let alerts = userAlerts.alerts
      
        let found
        for(let e of alerts) {
          if(e._id === req.params.alertId) {
            found = e
            break
          }
        }  

        let removed = alerts.splice(alerts.indexOf(found), 1)
        userAlerts.alerts = alerts
        await userAlerts.save()
        res.send({})

        if(removed.length>0)
          for(let element of removed[0].elements) {
            if(element.src) {
              let fileName = element.src.replace(/^.+\//g, '')
              await Api.unlink(fileName, req.params.userId)
            }
          }
      })
  }

}