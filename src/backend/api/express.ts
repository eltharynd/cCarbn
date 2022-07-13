import * as express from 'express'
require('express-async-errors')
import { createServer, Server } from 'http'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import { PORT } from '..'
import { AuthRoutes } from './endpoints/auth.routes'
import { UserRoutes } from './endpoints/user.routes'
import { AlertsRoutes } from './endpoints/alerts.routes'

import { UploadRoutes } from './endpoints/uploads.routes'
import { TTSRoutes } from './endpoints/tts.routes'

export class Api {
  static endpoints: express.Express
  static server: Server

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
      if (res.headersSent) return next(err)
      res.status(500).send({ message: 'Unspecified internal error', details: err.message })
      next(err)
    })

    Api.server = createServer(Api.endpoints)
    Api.server.listen(PORT)

    AuthRoutes.attach()
    UserRoutes.attach()
    AlertsRoutes.attach()
    UploadRoutes.attach()
    TTSRoutes.attach()
  }
}
