import * as express from 'express'
require('express-async-errors')
import { createServer, Server } from 'http'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import { PORT } from '..'
import { AuthRoutes, authMiddleware } from './endpoints/auth'
import { UserRoutes } from './endpoints/user'
import { AlertsRoutes } from './endpoints/alerts'
import { Mongo } from '../db/mongo'
import { User } from '../db/models/user'
import * as multer from 'multer'
import { TTS } from '../external/tts'
import { File } from '../db/models/files'
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


    AuthRoutes.attach()
    UserRoutes.attach()
    AlertsRoutes.attach()


    Api.endpoints.route('/api/uploads/:userId/:filename')
      .post(authMiddleware, Api.upload, async (req, res): Promise<any> => {
        let autoIndexing = req.headers['autoindexing']==='true'

        //@ts-ignore
        let file = req.file
        let readStream = Readable.from(file.buffer)

        let plain = req.params.filename.replace(/\.[^.]+$/gi,'')
        let extension = req.params.filename.replace(plain+'.','')  
        let i=0

        let found = await File.findOne({ filename: req.params.filename, 'metadata.userId': Mongo.ObjectId(req.params.userId) })
        if(found) await new Promise(async (resolve, reject) => {
          if(!autoIndexing) {
            Mongo.Upload.unlink({ _id: found._id, filename: req.params.filename}, (error, unlink) => {
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
          metadata: { userId: Mongo.ObjectId(req.params.userId),  usages: 1 },
          contentType: file.mimetype
        }, readStream, async (error, f): Promise<any> => {
          if(error) return res.status(500).send()
          res.send({
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
          })
          readStream.on("end", () => {
            res.status(200).end();
          })
          readStream.on("error", (err) => {
            console.error(err);
            res.status(500).send(err);
          })
        } catch (e) {
          console.error(e)
          return res.status(500).send()
        }
      })
      .delete(authMiddleware, async (req, res): Promise<any> => {
        let found = await File.findOne({ filename: req.params.filename, 'metadata.userId': Mongo.ObjectId(req.params.userId) })
        if(!found) return res.status(404).send()

        if(found.metadata.usages>1) {
          found.metadata.usages--
          await found.save()
          res.send({})
        } else {
          Mongo.Upload.unlink({ _id: found._id}, (error, unlink) => {
            if(error) {
              console.error(error)
              res.status(500).send({error})
            } else{
              res.send({})
            }
          })
        }
      })

    Api.endpoints.get('/api/uploads/:userId/link/:filename', async (req, res): Promise<any> => {
      let found = await File.findOne({ filename: req.params.filename, 'metadata.userId': Mongo.ObjectId(req.params.userId)})
      if(!found) return res.status(404).send()

      ++found.metadata.usages
      await found.save()
      res.send({})
    })

    Api.endpoints.get('/api/uploads/:userId/unlink/:filename', async (req, res): Promise<any> => {
      await Api.unlink(req.params.filename, req.params.userId, res)
    })
    



    //TODO delete once assessed
    let logger: any
    let saveLogs = async () => {
      try {
        for(let twitchName of Object.keys(logger)) {
          let found: any = await User.findOne({twitchName: twitchName})
          if(found) {
            if(!found.ttsStart)
              found.ttsStart = Date.now()

            if(+logger[twitchName] !== +found.ttsCharacters) {
              found.ttsCharacters = logger[twitchName]
              await found.save()
            }
          } else {
            console.error('could not find user for tmp logs')
          }
        }
      } catch(e) {
        console.error('could not save tmp logs')
        console.error(e)
      }
    }
    setTimeout(async () => {
      if(!logger) {
        logger = {}
        console.log('creating logs')
        let users = await User.find()
        for(let u of users) {
          if(u.ttsStart)
            logger[u.twitchName] = +u.ttsCharacters
        }
      }
    }, 1000);
    Api.endpoints.get('/api/logger', async (req,res) => {
      res.send(logger)
    })

    Api.endpoints.get('/api/tts/:userId/:voice/:text', async (req,res): Promise<any> => {
      let text = req.params.text.replace(/\&questionmark\;/gi, '?')
      if(!text || text.length<1) return res.status(400).send()

      let user: any = await User.findOne({ _id: Mongo.ObjectId(req.params.userId)})
      if(!user)
        return res.send(403).send()

      if(/^google_/.test(req.params.voice) || /^aws_/.test(req.params.voice)) {
        if(!logger.hasOwnProperty(user.twitchDisplayName))
          logger[user.twitchDisplayName] = req.params.text.length
        else
          logger[user.twitchDisplayName] = logger[user.twitchDisplayName] + req.params.text.length
        saveLogs()
      }
      
      
      let result = await TTS.convert(user, text, req.params.voice)
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

  }

  static async unlink (filename, userId, res?): Promise<any> {
    let found = await File.findOne({ filename: filename, 'metadata.userId': Mongo.ObjectId(userId) })
    if(!found) return res ? res.status(404).send() : null

    if(found.metadata.usages<=1) {
      Mongo.Upload.unlink({ _id: found._id}, (error, unlink) => {
        if(error) {
          console.error(error)
          if(res) res.status(500).send()
        } else if(res) res.send({})
      })
    } else {
      --found.metadata.usages
      await found.save()
      if(res) res.send({})
    }
  }

}
