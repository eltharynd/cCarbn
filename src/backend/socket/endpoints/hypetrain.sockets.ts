import * as socketIO from 'socket.io'
import { Socket } from '../socket'

export class HypetrainSockets {
  static attach(socket: socketIO.Socket) {
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
  }
}
