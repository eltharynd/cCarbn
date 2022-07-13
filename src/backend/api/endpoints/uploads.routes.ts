import { Alerts } from '../../db/models/alerts.model'
import { Api } from '../express'
import { authMiddleware } from './auth.routes'
import { Mongo } from '../../db/mongo'
import { filter, from, retryWhen, take } from 'rxjs'
import { File } from '../../db/models/files.model'
const uuid = require('uuid')
import * as multer from 'multer'
const { Readable } = require('stream')

export class UploadRoutes {
  private static upload: multer.Mi

  static attach() {
    UploadRoutes.upload = multer({ storage: multer.memoryStorage() }).single('file')

    Api.endpoints
      .route('/api/uploads/:userId/:filename')
      .get(async (req, res) => {
        let found: any = await Mongo.Upload.findOne({ filename: req.params.filename, 'metadata.userId': Mongo.ObjectId(req.params.userId) })
        if (!found) return res.status(404).send()
        try {
          const readStream = await Mongo.Upload.read({ _id: found._id })
          if (!readStream) return res.status(404).send()
          res.set({
            'content-type': found.contentType,
            'Last-modified': found.updatedAt.toUTCString(),
          })
          readStream.on('data', (chunk) => {
            res.write(chunk)
          })
          readStream.on('end', () => {
            res.status(200).end()
          })
          readStream.on('error', (err) => {
            console.error(err)
            res.status(500).send(err)
          })
        } catch (e) {
          console.error(e)
          return res.status(500).send()
        }
      })
      .post(authMiddleware, UploadRoutes.upload, async (req, res) => {
        let autoIndexing = req.headers['autoindexing'] === 'true'

        //@ts-ignore
        let file = req.file
        let readStream = Readable.from(file.buffer)

        let plain = req.params.filename.replace(/\.[^.]+$/gi, '')
        let extension = req.params.filename.replace(plain + '.', '')
        let i = 0

        let found = await File.findOne({ filename: req.params.filename, 'metadata.userId': Mongo.ObjectId(req.params.userId) })
        if (found)
          await new Promise(async (resolve, reject) => {
            if (!autoIndexing) {
              Mongo.Upload.unlink({ _id: found._id, filename: req.params.filename }, (error, unlink) => {
                if (error) reject(error)
                else resolve(unlink)
              })
            } else {
              while (found) {
                found = await Mongo.Upload.findOne({ filename: `${plain}-${++i}.${extension}`, 'metadata.userId': Mongo.ObjectId(req.params.userId) })
              }
              resolve(found)
            }
          })

        Mongo.Upload.write(
          {
            filename: `${plain}${i > 0 ? `-${i}` : ''}.${extension}`,
            metadata: { userId: Mongo.ObjectId(req.params.userId), usages: 1 },
            contentType: file.mimetype,
          },
          readStream,
          async (error, f): Promise<any> => {
            if (error) return res.status(500).send()
            res.send({
              url: `uploads/${req.params.userId}/${plain}${i > 0 ? `-${i}` : ''}.${extension}`,
            })
          }
        )
      })
      .delete(authMiddleware, async (req, res) => {
        let found = await File.findOne({ filename: req.params.filename, 'metadata.userId': Mongo.ObjectId(req.params.userId) })
        if (!found) return res.status(404).send()

        if (found.metadata.usages > 1) {
          found.metadata.usages--
          await found.save()
          res.send({})
        } else {
          Mongo.Upload.unlink({ _id: found._id }, (error, unlink) => {
            if (error) {
              console.error(error)
              res.status(500).send({ error })
            } else {
              res.send({})
            }
          })
        }
      })

    Api.endpoints.get('/api/uploads/:userId/link/:filename', async (req, res) => {
      let found = await File.findOne({ filename: req.params.filename, 'metadata.userId': Mongo.ObjectId(req.params.userId) })
      if (!found) return res.status(404).send()

      ++found.metadata.usages
      await found.save()
      res.send({})
    })

    Api.endpoints.get('/api/uploads/:userId/unlink/:filename', async (req, res) => {
      await UploadRoutes.unlink(req.params.filename, req.params.userId, res)
    })
  }

  static async unlink(filename, userId, res?) {
    let found = await File.findOne({ filename: filename, 'metadata.userId': Mongo.ObjectId(userId) })
    if (!found) return res ? res.status(404).send() : null

    if (found.metadata.usages <= 1) {
      Mongo.Upload.unlink({ _id: found._id }, (error, unlink) => {
        if (error) {
          console.error(error)
          if (res) res.status(500).send()
        } else if (res) res.send({})
      })
    } else {
      --found.metadata.usages
      await found.save()
      if (res) res.send({})
    }
  }
}
