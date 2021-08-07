import * as socketIO from 'socket.io'
import { CREDENTIALS } from '..'
import { Api } from '../api/express'
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
        clientId: CREDENTIALS.clientId,
      })

      Cheers.bind(socket)
      HypeTrain.bind(socket)
      Predictions.bind(socket)
      Subscriptions.bind(socket)

      socket.on('disconnect', () => {
        Socket.connections.splice(Socket.connections.indexOf(socket), 1)

        Cheers.unbind(socket)
        HypeTrain.unbind(socket)
        Predictions.unbind(socket)
        Subscriptions.unbind(socket)
        
      })
    })
  }

  public static addListener() {

  }

  public static removeListener() {

  }

}