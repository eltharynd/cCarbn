import * as socketIO from 'socket.io'

export class PredictionsSockets {
  static attach(socket: socketIO.Socket) {
    socket.on('predictions-test-begin', (data) => {
      if (data.userId) {
        socket.to(data.userId).emit('predictions-test-begin', data)
      }
    })
    socket.on('predictions-test-progress', (data) => {
      if (data.userId) {
        socket.to(data.userId).emit('predictions-test-progress', data)
      }
    })
    socket.on('predictions-test-lock', (data) => {
      if (data.userId) {
        socket.to(data.userId).emit('predictions-test-lock', data)
      }
    })
    socket.on('predictions-test-end', (data) => {
      if (data.userId) {
        socket.to(data.userId).emit('predictions-test-end', data)
      }
    })
  }
}
