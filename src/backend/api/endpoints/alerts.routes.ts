import { Alerts } from '../../db/models/alerts.model'
import { Api } from '../express'
import { authMiddleware } from './auth.routes'
import { Mongo } from '../../db/mongo'
import { filter, from, retryWhen, take } from 'rxjs'
import { File } from '../../db/models/files.model'
import { UploadRoutes } from './uploads.routes'
const uuid = require('uuid')

export class AlertsRoutes {
  static attach() {
    Api.endpoints
      .route('/api/alerts/:userId')
      .get(async (req, res) => {
        let alerts: any = await Alerts.findOne({ userId: Mongo.ObjectId(req.params.userId) })
        if (!alerts) {
          alerts = await Alerts.create({ userId: Mongo.ObjectId(req.params.userId), alerts: [] })
          await alerts.save()
        }
        res.send(alerts.alerts)
      })
      .post(authMiddleware, async (req, res) => {
        let alert = req.body

        let userAlerts: any = await Alerts.findOne({ userId: Mongo.ObjectId(req.params.userId) })
        if (!userAlerts) userAlerts = await Alerts.create({ userId: Mongo.ObjectId(req.params.userId), alerts: [] })
        let alerts = userAlerts.alerts

        let found
        if (alert._id) {
          found = await from(alerts)
            .pipe(
              filter((e: any) => e._id === alert._id),
              take(1)
            )
            .toPromise()
        }

        if (found) {
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
      .patch(authMiddleware, async (req, res) => {
        let alert = req.body

        let userAlerts: any = await Alerts.findOne({ userId: Mongo.ObjectId(req.params.userId) })
        if (!userAlerts) userAlerts = await Alerts.create({ userId: Mongo.ObjectId(req.params.userId), alerts: [] })
        let alerts = userAlerts.alerts

        let found
        if (alert._id) {
          found = await from(alerts)
            .pipe(
              filter((e: any) => e._id === alert._id),
              take(1)
            )
            .toPromise()
        }

        if (found) {
          alert._id = found._id ? found._id : uuid.v4()
          alerts[alerts.indexOf(found)].enabled = !alert.enabled
        } else {
          alert._id = uuid.v4()
          alerts.push(alert)
        }
        userAlerts.alerts = alerts
        await userAlerts.save()
        res.send(alert._id)
      })
    Api.endpoints.get('/api/alerts/:userId/move/:direction/:index', authMiddleware, async (req, res) => {
      let userAlerts = await Alerts.findOne({ userId: Mongo.ObjectId(req.params.userId) })
      if (!userAlerts) return res.status(404).send()
      let alerts = userAlerts.alerts
      let index = parseInt(req.params.index)
      let upward = req.params.direction === 'upwards' ? true : false
      alerts.splice(+index + (upward ? -1 : 1), 0, alerts.splice(index, 1)[0])
      await userAlerts.save()
      res.send({})
    })
    Api.endpoints.route('/api/alerts/:userId/:alertId').delete(authMiddleware, async (req, res) => {
      let userAlerts: any = await Alerts.findOne({ userId: Mongo.ObjectId(req.params.userId) })
      if (!userAlerts) userAlerts = await Alerts.create({ userId: Mongo.ObjectId(req.params.userId), alerts: [] })
      let alerts = userAlerts.alerts

      let found
      for (let e of alerts) {
        if (e._id === req.params.alertId) {
          found = e
          break
        }
      }
      if (!found) return res.status(404).send()

      let removed = alerts.splice(alerts.indexOf(found), 1)
      userAlerts.alerts = alerts
      await userAlerts.save()

      if (removed.length > 0)
        for (let element of removed[0].elements) {
          if (element.src) {
            let fileName = decodeURI(element.src.replace(/^.+\//g, ''))
            let file = await File.findOne({ filename: fileName, 'metadata.userId': Mongo.ObjectId(req.params.userId) })
            if (file) {
              if (file.metadata.usages > 1) {
                --file.metadata.usages
                await file.save()
              } else {
                await UploadRoutes.unlink(fileName, req.params.userId, res)
                return
              }
            }
          }
        }
      res.send({})
    })
  }
}
