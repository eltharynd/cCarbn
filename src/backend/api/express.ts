import * as express from 'express'
import { createServer, Server } from 'http'
import * as cors from 'cors'
import * as bodyParser from 'body-parser'
import { PORT } from '..'

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

    Api.server = createServer(Api.endpoints)
    Api.server.listen(PORT)

    Api.endpoints.get('/api/status', function (req, res) {
      res.status(200).json({ status: 'UP', test: 'working' })
    })

    Api.endpoints.get('*', async (req, res) => {
      res.status(200).send(`No route specified... but, HEY!!! I'm working!!`)
    })
  }
}
