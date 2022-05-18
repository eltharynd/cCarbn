import * as socketIO from 'socket.io'
import { Socket } from '../socket'

export class OBSSockets {
  static attach(socket: socketIO.Socket) {
    socket.on('requestOBSlist', (data) => {
      if (data.userId) socket.to(data.userId).emit('requestOBSlist', data)
    })

    socket.on('sendOBSlist', (data) => {
      if (data.userId) {
        socket.to(data.userId).emit('receiveOBSlist', data.response)
      }
    })
  }
}
