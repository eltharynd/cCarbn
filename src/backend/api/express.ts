import * as express from 'express'
require('express-async-errors')
import { createServer, Server } from 'http'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import { PORT } from '..'
import { Auth } from './endpoints/auth'
import { User } from './endpoints/user'

export class Api {
  static endpoints: express.Express
  static server: Server

  static eventsCollection: any[] = []
  constructor() {
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


    Api.endpoints.get('/api/status', async (req, res) => {
      res.json({ status: 'UP', test: 'working' })
    })

    Api.endpoints.get('*', async (req, res) => {
      res.send(`No route specified... but, HEY!!! I'm working!!`)
    })


  
  }
}
