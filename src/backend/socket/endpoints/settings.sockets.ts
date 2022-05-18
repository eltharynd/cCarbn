import * as socketIO from 'socket.io'
import { Socket } from '../socket'

export class SettingsSockets {
  static attach(socket: socketIO.Socket) {
    socket.on('settings-updated', (data) => {
      if (data.userId) {
        socket.to(data.userId).emit('settings-updated', data)
      }
    })
  }
}
