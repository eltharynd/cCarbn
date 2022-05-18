import { filter, from, take } from 'rxjs'
import { Alerts } from '../../db/models/alerts.model'
import { User } from '../../db/models/user.model'
import * as socketIO from 'socket.io'
import { Socket } from '../socket'

export class StreamDeckSockets {
  static attach(socket: socketIO.Socket) {
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
  }
}
