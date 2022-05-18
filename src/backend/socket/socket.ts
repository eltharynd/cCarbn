import { filter, from, take } from 'rxjs'
import * as socketIO from 'socket.io'
import { Api } from '../api/express'
import { Alerts } from '../db/models/alerts.model'
import { User } from '../db/models/user.model'
import { Mongo } from '../db/mongo'
import { Chat, IChatClient } from '../twitch/chat'
import { OBSSockets } from './endpoints/obs.sockets'
import { StreamDeckSockets } from './endpoints/streamdeck.sockets'
import { AlertsSockets } from './endpoints/alerts.sockets'
import { SettingsSockets } from './endpoints/settings.sockets'
import { HypetrainSockets } from './endpoints/hypetrain.sockets'

export class Socket {
  static io: socketIO.Server
  private static connections: socketIO.Socket[] = []

  constructor() {
    Socket.io = new socketIO.Server(Api.server, {
      path: '/api/socket.io',
      transports: ['websocket'],
    })

    Socket.io.on('connect', (socket: socketIO.Socket) => {
      Socket.connections.push(socket)

      socket.emit('clientId', {
        clientId: Mongo.clientId,
      })

      socket.on('bind', (data) => {
        if (data.userId) socket.join(data.userId)
      })

      StreamDeckSockets.attach(socket)
      OBSSockets.attach(socket)
      AlertsSockets.attach(socket)
      SettingsSockets.attach(socket)
      HypetrainSockets.attach(socket)

      //TODO build a queue not to repeat messages when user has multiple browsersources opened
      socket.on('chat-relay', async (data) => {
        if (data.userId && data.message) {
          let found: IChatClient | undefined = await from(Chat.clients)
            .pipe(
              filter((c: IChatClient) => c.userId === data.userId),
              take(1)
            )
            .toPromise()
          if (found) {
            found.client.say(found.channel, data.message)
          }
        }
      })

      socket.on('unbind', (data) => {
        if (data.userId) socket.leave(data.userId)
      })

      socket.on('disconnect', () => {
        Socket.connections.splice(Socket.connections.indexOf(socket), 1)
      })
    })
  }
}
