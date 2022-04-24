import * as express from 'express'
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


    Auth.attach()
    User.attach()
    Events.attach()


    Api.endpoints.get('/api/logger', async (req,res) => {
      res.json(Api.eventsCollection)
    })
    Api.endpoints.get('/api/hypetrain', async (req,res) => {
      setTimeout(async () => {
        let train = JSON.parse('' + fs.readFileSync('tag.json'))
        let start
        let delta 

        let broadcasterId = train[0].event.broadcaster_user_id
        let user: any =  await MongoUser.findOne({ twitchId: broadcasterId })

        for(let e of train) {
          if(!start) {
            start = e.time
            delta = Date.now() - start
          }
          setTimeout(async () => {  

            let buffer = JSON.parse(JSON.stringify(e.event))
            buffer.type = e.type
            if(buffer.last_contribution) {
              let helixUser: HelixUser|null = await Twitch.client.users.getUserById(buffer.last_contribution.user_id)
              if(helixUser) 
              buffer.last_contribution.picture = helixUser.profilePictureUrl
            }
            if(buffer.top_contributions) {
              for(let u of buffer.top_contributions) {
                let helixUser: HelixUser|null = await Twitch.client.users.getUserById(u.user_id)
                if(helixUser) 
                  u.picture = helixUser.profilePictureUrl
              }  
            }
            buffer.time = Date.now()
            if(buffer.started_at) buffer.started_at = new Date(new Date(buffer.started_at).getTime() + delta)
            if(buffer.ended_at) buffer.ended_at = new Date(new Date(buffer.ended_at).getTime() + delta)
            if(buffer.expires_at) buffer.expires_at = new Date(new Date(buffer.expires_at).getTime() + delta)
            if(buffer.cooldown_ends_at) buffer.cooldown_ends_at = new Date(new Date(buffer.cooldown_ends_at).getTime() + delta)
            
            //Socket.io.to('6111a02594ce3e08c3274c5f').emit('hypetrain', buffer)
            if(buffer.type === 'Hype Train Begin') {
              console.log('emitting', e.type)
              //Socket.io.to(user._id.toString()).emit('hypetrain', buffer)  //real
              Socket.io.to('611180bbda7c789038a04a1b').emit('hypetrain', buffer)  //dev
              //Socket.io.to('61118f4ce72d0103d112f005').emit('hypetrain', buffer)    //prod
            } else {
              setTimeout(() => {
                console.log('emitting', e.type)
                //Socket.io.to(user._id.toString()).emit('hypetrain', buffer)  //real
                Socket.io.to('611180bbda7c789038a04a1b').emit('hypetrain', buffer)  //dev
                //Socket.io.to('61118f4ce72d0103d112f005').emit('hypetrain', buffer)    //prod
              }, 1000);
            }
          }, e.time - start);
        }
      }, 2000)
      res.json('Starting test to cakeums (lvl 5 hype train)')
    })

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
            console.log(err);
            res.status(500).send(err);
          });


        } catch (e) {
          console.error(e)
          return res.status(500).send()
        }
        /* Mongo.Upload.read({filename: req.params.filename, metadata: { userId: Mongo.ObjectId(req.params.userId) } }, async (error, buffer) => {
          if(error) return res.status(500).send()
          res.set({
            'content-type': found.contentType,
            'Last-modified': found.updatedAt.toUTCString()
          })
          res.send(await Buffer.from(buffer))
        }) */
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
