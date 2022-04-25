import * as express from 'express'
import * as stream from 'stream'
require('express-async-errors')
import { createServer, Server } from 'http'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import { PORT } from '..'
import { Auth, authMiddleware } from './endpoints/auth'
import { User } from './endpoints/user'
import { Events } from './endpoints/events'
import { Mongo } from '../db/mongo'
import { User as MongoUser } from '../db/models/user'
import { UploadUsage } from '../db/models/upload-usage'
import * as multer from 'multer'
import * as fs from 'fs'
import { HelixUser } from '@twurple/api/lib'
import { Twitch } from '../twitch/twitch'
import { Socket } from '../socket/socket'
import { TTS } from '../external/tts'
const { Readable } = require('stream');

export class Api {
  static endpoints: express.Express
  static server: Server
  private static upload: multer.Mi

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


    Auth.attach()
    User.attach()
    Events.attach()


    Api.endpoints.route('/api/uploads/:userId/:filename')
      .post(authMiddleware, Api.upload, async (req, res): Promise<any> => {
        let autoIndexing = req.headers['autoindexing']==='true'

        //@ts-ignore
        let file = req.file
        let readStream = Readable.from(file.buffer)

        let plain = req.params.filename.replace(/\.[^.]+$/gi,'')
        let extension = req.params.filename.replace(plain+'.','')  
        let i=0

        let found: any = await Mongo.Upload.findOne({ filename: req.params.filename, 'metadata.userId': Mongo.ObjectId(req.params.userId) })
        if(found) await new Promise(async (resolve, reject) => {
          if(!autoIndexing) {
            await UploadUsage.remove({ fileId: found._id })
            await Mongo.Upload.unlink({ _id: found._id}, (error, unlink) => {
              if(error) reject(error)
              else resolve(unlink)
            })
            
          } else {
            while(found) {
              found = await Mongo.Upload.findOne({ filename: `${plain}-${++i}.${extension}`, 'metadata.userId': Mongo.ObjectId(req.params.userId) })
            }
            resolve(found)
          }
        })

        await Mongo.Upload.write({
          filename: `${plain}${i>0 ? `-${i}` : ''}.${extension}`,
          metadata: { userId: Mongo.ObjectId(req.params.userId),  },
          contentType: file.mimetype
        }, readStream, async (error, f): Promise<any> => {
          if(error) return res.status(500).send()
           await UploadUsage.create({
            fileId: f._id,
            usages: 1
          })
          res.send({
            //url: /image\//.test(file.mimetype) ? `uploads/${req.params.userId}/${file.originalname}` : null
            url: `uploads/${req.params.userId}/${plain}${i>0 ? `-${i}` : ''}.${extension}`
          })
        })

      })
      .get(async (req, res): Promise<any> => {
        let found: any = await Mongo.Upload.findOne({ filename: req.params.filename, 'metadata.userId': Mongo.ObjectId(req.params.userId) })
        if(!found) return res.status(404).send()
        try{
          const readStream = await Mongo.Upload.read({_id: found._id })
          if(!readStream) return res.status(404).send()
          res.set({
            'content-type': found.contentType,
            'Last-modified': found.updatedAt.toUTCString()
          })
          readStream.on("data", (chunk) => {
            res.write(chunk);
          });
          readStream.on("end", () => {
            res.status(200).end();
          });
          readStream.on("error", (err) => {
            console.error(err);
            res.status(500).send(err);
          });


        } catch (e) {
          console.error(e)
          return res.status(500).send()
        }
      })
      .delete(authMiddleware, async (req, res): Promise<any> => {
        let found: any = await Mongo.Upload.findOne({ filename: req.params.filename, metadata: { userId: Mongo.ObjectId(req.params.userId) } })
        if(!found) return res.status(404).send()
        await new Promise(async (resolve, reject) => {
          let usage: any = UploadUsage.findOne({fileId: found._id})
          if(+usage.usages>1) {
            usage.usages = +usage.usages -1
            await usage.save()
          } else 
            await UploadUsage.remove({ fileId: found._id })

          Mongo.Upload.unlink({ _id: found._id}, (error, unlink) => {
            if(error) reject(error)
            else resolve(unlink)
          })
        })
        res.send({})
      })

    Api.endpoints.get('/api/uploads/:userId/link/:filename', async (req, res): Promise<any> => {
      let found: any = await Mongo.Upload.findOne({ filename: req.params.filename, 'metadata.userId': Mongo.ObjectId(req.params.userId) })
      if(!found) return res.status(404).send()
      let usages: any = await UploadUsage.findOne({ fileId: found._id }) 
      if(!usages) {
          usages = await UploadUsage.create({
          fileId: found._id,
          usages: 1
        }) 
      } else  
        usages.usages = +usages.usages + 1

      await usages.save()
      res.send({})
    })

    Api.endpoints.get('/api/uploads/:userId/unlink/:filename', async (req, res): Promise<any> => {
      await Api.unlink(req.params.filename, req.params.userId, res)
    })
    
    Api.endpoints.get('/api/tts/:text', async (req,res): Promise<any> => {
      let text = req.params.text.replace(/\&questionmark\;/gi, '?')
      if(!text || text.length<1) return res.status(400).send()

      let result = await TTS.convert(text)
      if(!result) return res.status(500).send()

      try{
        res.set({
          'content-type': 'audio/mpeg'
        })
        result.pipe(res)
      } catch (e) {
        console.error(e)
        return res.status(500).send()
      } 
    })

/*     Api.endpoints.get('/api/status', async (req, res) => {
      res.json({ status: 'UP', test: 'working' })
    }) */

/*     Api.endpoints.get('*', async (req, res) => {
      res.send(`No route specified... but, HEY!!! I'm working!!`)
    }) */


  
  }

  static async unlink (filename, userId, res?): Promise<any> {
    let found: any = await Mongo.Upload.findOne({ filename: filename, 'metadata.userId': Mongo.ObjectId(userId) })
    if(!found) return res ? res.status(404).send() : null
    let usages: any = await UploadUsage.findOne({ fileId: found._id }) 
    if(!usages) return res ? res.send(`Nothing to do!`) : null
    
    if(+usages.usages<=1) {
      await UploadUsage.deleteOne({ _id: usages._id})
      await new Promise(async (resolve, reject) => {
        Mongo.Upload.unlink({ _id: found._id}, (error, unlink) => {
          if(error) reject(error)
          else resolve(unlink)
        })
      })
    } else {
      usages.usages = +usages.usages - 1
      await usages.save()
    }
    if(res) res.send({})
    return 
  }
}
