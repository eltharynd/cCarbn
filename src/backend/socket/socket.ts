import * as socketIO from 'socket.io'
import { Api } from '../api/express'
import { Mongo } from '../db/mongo'
import { Cheers } from './events/cheers'
import { HypeTrain } from './events/hypetrain'
import { Predictions } from './events/predictions'
import { Subscriptions } from './events/subscriptions'

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

      socket.on('test', (data) => {
        if(data.userId) 
          Socket.io.to(data.userId).emit('event', data)
      })
      
      Cheers.bind(socket)
      HypeTrain.bind(socket)
      Predictions.bind(socket)
      Subscriptions.bind(socket)

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