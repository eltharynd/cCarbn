import * as express from 'express'
require('express-async-errors')
import { createServer, Server } from 'http'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import { PORT } from '..'
import { Auth, authMiddleware } from './endpoints/auth'
import { User } from './endpoints/user'
import { Mongo } from '../db/mongo'
import * as multer from 'multer'
import * as fs from 'fs'
const { Readable } = require('stream');

export class Api {
  static endpoints: express.Express
  static server: Server
  private static upload: multer.Mi

  static eventsCollection: any[] = []
  constructor() {

    Api.upload = multer({ storage: multer.memoryStorage() }).single('file')

    Api.endpoints = express()
    Api.endpoints.use(
      cors({
        origin: '*',
        optionsSuccessStatus: 200,
      })
    )
    Api.endpoints.use(bodyParser.json())
    Api.endpoints.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      next()
    })

    Api.endpoints.use((err, req, res, next) => {
      if(res.headersSent)
        return next(err)
      res.status(500).send({message: 'Unspecified internal error', details: err.message})
      next(err)
    })

    Api.server = createServer(Api.endpoints)
    Api.server.listen(PORT)


    Auth.bind()
    User.bind()


    Api.endpoints.get('/api/logger', async (req,res) => {
      res.json(Api.eventsCollection)
    })

    Api.endpoints.route('/api/uploads/:userId/:filename')
      .post(authMiddleware, Api.upload, async (req, res) => {
        //@ts-ignore
        let file = req.file
        let readStream = Readable.from(file.buffer)
        let found: any = await Mongo.Upload.findOne({ filename: req.params.filename, metadata: { userId: Mongo.ObjectId(req.params.userId) } })
        if(found) await new Promise((resolve, reject) => {
          Mongo.Upload.unlink({ _id: found._id}, (error, unlink) => {
            if(error) reject(error)
            else resolve(unlink)
          })
        })
        await Mongo.Upload.write({
          filename: file.originalname,
          metadata: { userId: Mongo.ObjectId(req.params.userId) },
          contentType: file.mimetype
        }, readStream, (error, f) => {
          if(error) return res.status(500).send()
          res.send({
            url: /image\//.test(file.mimetype) ? `uploads/${req.params.userId}/${file.originalname}` : null
          })
        })
      })
      .get(async (req, res) => {
        let found: any = await Mongo.Upload.findOne({ filename: req.params.filename, metadata: { userId: Mongo.ObjectId(req.params.userId) } })
        if(!found) return res.status(404).send()

        Mongo.Upload.read({filename: req.params.filename, metadata: { userId: Mongo.ObjectId(req.params.userId) } }, (error, buffer) => {
          if(error) return res.status(500).send()
          res.set({
            'content-type': found.contentType,
            'Last-modified': found.updatedAt.toUTCString()
          })
          res.send(Buffer.from(buffer))
        })
      })
      .delete(authMiddleware, async (req, res) => {
        let found: any = await Mongo.Upload.findOne({ filename: req.params.filename, metadata: { userId: Mongo.ObjectId(req.params.userId) } })
        if(!found) return res.status(404).send()
        await new Promise((resolve, reject) => {
          Mongo.Upload.unlink({ _id: found._id}, (error, unlink) => {
            if(error) reject(error)
            else resolve(unlink)
          })
        })
        res.send()
      })


/*     Api.endpoints.get('/api/status', async (req, res) => {
      res.json({ status: 'UP', test: 'working' })
    }) */

/*     Api.endpoints.get('*', async (req, res) => {
      res.send(`No route specified... but, HEY!!! I'm working!!`)
    }) */


  
  }
}
