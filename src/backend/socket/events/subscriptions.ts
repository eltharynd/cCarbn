import { Socket } from "socket.io"

export class Subscriptions {
  static bind = (socket: Socket) => {
/*     socket.on('subscriptions', (data) => {
      if(data.userId) {
        socket.join(data.userId)
      }
    }) */
  }

  static unbind = (socket: Socket) => {

  }
}