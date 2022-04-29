import { filter, from, Subject, take } from 'rxjs'
import * as socketIO from 'socket.io'
import { Api } from '../api/express'
import { Mongo } from '../db/mongo'
import { Chat, IChatClient } from '../twitch/chat'

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

      socket.on('elementsUpdated', (data) => {
        if(data.userId) {
          socket.to(data.userId).emit('elementsUpdated', data.elements)
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

  public static addListener() {

  }

  public static removeListener() {

  }

}