import * as socketIO from 'socket.io'
import { Socket } from '../socket'

export class AlertsSockets {
  static attach(socket: socketIO.Socket) {
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
  }
}
