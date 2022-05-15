import { filter, from, take } from 'rxjs'
import * as socketIO from 'socket.io'
import { Api } from '../api/express'
import { Alerts } from '../db/models/alerts'
import { User } from '../db/models/user'
import { Mongo } from '../db/mongo'
import { Chat, IChatClient } from '../twitch/chat'

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

      /* STREAM DECK PAIRING */

      socket.on('pair-check', (data) => {
        if (data.pairingKey) {
          socket.emit('pair-check', { waiting: Socket.io.sockets.adapter.rooms.has(data.pairingKey) })
        }
      })
      socket.on('pair-request', (data) => {
        if (data.pairingKey) socket.join(data.pairingKey)
      })
      socket.on('pair-successfull', (data) => {
        if (data.pairingKey) {
          socket.leave(data.pairingKey)
          socket.to(data.pairingKey).emit('pairing-successfull', {})
        }
      })
      socket.on('pair', (data) => {
        if (data.userId && data.pairingKey) {
          socket.join(data.pairingKey)
          Socket.io.to(data.pairingKey).emit('pair', data)
        }
      })
      socket.on('bind-streamdeck', (data) => {
        if (data.userId) {
          socket.emit('accept-streamdeck', {
            accepted: true,
          })
        }
      })
      socket.on('streamdeck-test', async (data) => {
        try {
          if (data.userId) {
            let user = await User.findOne({ _id: data.userId })
            if (user) {
              let alerts: any = await Alerts.findOne({ userId: user._id })
              let alert = await from(alerts.alerts)
                .pipe(
                  filter((a: any) => a._id === data.alertId),
                  take(1)
                )
                .toPromise()
              if (alert) Socket.io.to(data.userId).emit('alerts-test', alert)
            }
          }
        } catch (e) {
          console.error(e)
        }
      })

      /* OBS */

      socket.on('requestOBSlist', (data) => {
        if (data.userId) socket.to(data.userId).emit('requestOBSlist', data)
      })

      socket.on('sendOBSlist', (data) => {
        if (data.userId) {
          socket.to(data.userId).emit('receiveOBSlist', data.response)
        }
      })

      /* ALERTS */

      socket.on('alerts-updated', (data) => {
        if (data.userId) {
          socket.to(data.userId).emit('alerts-updated', data)
        }
      })

      socket.on('alerts-test', (data) => {
        if (data.userId) {
          socket.to(data.userId).emit('alerts-test', data)
        }
      })

      /* SETTINGS */
      socket.on('settings-updated', (data) => {
        if (data.userId) {
          socket.to(data.userId).emit('settings-updated', data)
        }
      })

      /* HYPETRAIN */
      socket.on('hypetrain-test-start', (data) => {
        if (data.userId) {
          socket.to(data.userId).emit('hypetrain-test-start', {})
        }
      })
      socket.on('hypetrain-test-change-level', (data) => {
        if (data.userId) {
          socket.to(data.userId).emit('hypetrain-test-change-level', data)
        }
      })
      socket.on('hypetrain-test-add-carriage', (data) => {
        if (data.userId) {
          socket.to(data.userId).emit('hypetrain-test-add-carriage')
        }
      })
      socket.on('hypetrain-test-end', (data) => {
        if (data.userId) {
          socket.to(data.userId).emit('hypetrain-test-end', {})
        }
      })
      socket.on('hypetrain-test-stop', (data) => {
        if (data.userId) {
          socket.to(data.userId).emit('hypetrain-test-stop', {})
        }
      })

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
