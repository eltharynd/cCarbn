import { filter, from, take } from 'rxjs'
import * as socketIO from 'socket.io'
import { Api } from '../api/express'
import { Alerts } from '../db/models/alerts'
import { User } from '../db/models/user'
import { Mongo } from '../db/mongo'
import { Chat, IChatClient } from '../twitch/chat'

//require("events").captureRejections = true;

export class Socket {
  static io: socketIO.Server
  private static connections: socketIO.Socket[] = []

  constructor() {
    Socket.io = new socketIO.Server(Api.server, {
      path: '/api/socket.io',
      transports: ['websocket']
    })

    Socket.io.on('connect', (socket: socketIO.Socket) => {
      Socket.connections.push(socket)

      socket.emit('clientId', {
        clientId: Mongo.clientId,
      })

      socket.on('bind', (data) => {
        if(data.userId) 
          socket.join(data.userId)
      })


      socket.on('pair-check', data => {
        if(data.pairingKey) {
          socket.emit('pair-check', {waiting: Socket.io.sockets.adapter.rooms.has(data.pairingKey)})
        }
      })
      socket.on('pair-request', data => { 
        if(data.pairingKey)
          socket.join(data.pairingKey)
      })

      socket.on('pair-successfull', data => {
        if(data.pairingKey) {
          socket.leave(data.pairingKey)
          socket.to(data.pairingKey).emit('pairing-successfull', {})
        }
      })

      socket.on('pair', (data) => {
        if(data.userId && data.pairingKey) {
          socket.join(data.pairingKey)
          Socket.io.to(data.pairingKey).emit('pair', data)
        }
      })

      socket.on('bind-streamdeck', (data) => {
        if(data.userId) {
          socket.emit('accept-streamdeck', {
            accepted: true
          })
        }
      })
      socket.on('streamdeck-test', async (data) => {
        try {
          if(data.userId) {
            let user = await User.findOne({ _id: data.userId })
            if(user) {
              let alerts: any = await Alerts.findOne({ userId: user._id })
              let alert = await from(alerts.alerts).pipe(
                filter((a: any) => a._id === data.alertId),
                take(1)
              ).toPromise()
              if(alert)
                Socket.io.to(data.userId).emit('test', alert)
            }
          }
        } catch(e) {
          console.error(e)
        }
      })

      socket.on('unbind', (data) => {
        if(data.userId) 
          socket.leave(data.userId)
      })

      socket.on('requestOBSlist', (data) => {
        if(data.userId)
          socket.to(data.userId).emit('requestOBSlist', data)
      })

      socket.on('sendOBSlist', data => {
        if(data.userId) {
          socket.to(data.userId).emit('receiveOBSlist', data.response)
        }
      })

      socket.on('alertsUpdated', (data) => {
        if(data.userId) {
          socket.to(data.userId).emit('alertsUpdated', data.alerts)
        }
      })

      socket.on('test', (data) => {
        if(data.userId) {
          socket.to(data.userId).emit('test', data)
        }
      })

      //TODO build a queue not to repeat messages when user has multiple browsersources opened
      socket.on('chat-relay', async (data) => {
        if(data.userId && data.message) {
          let found: IChatClient|undefined = await from(Chat.clients).pipe(
            filter((c: IChatClient) => c.userId === data.userId),
            take(1)
          ).toPromise()
          if(found) {
            found.client.say(found.channel, data.message)
          }
        }
      })

      socket.on('disconnect', () => {
        Socket.connections.splice(Socket.connections.indexOf(socket), 1)
      })
    }) 

  }
}