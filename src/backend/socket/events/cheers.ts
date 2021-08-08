import { EventSubChannelCheerEvent } from "@twurple/eventsub/lib"
import * as socketIO from "socket.io"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"

export class Cheers {

  static cheerEvent = (event: EventSubChannelCheerEvent) => {
    console.log(toJSON(event))
    Socket.io.to('cheer').emit('cheer', Object.assign({eventName: 'start'}, toJSON(event)))
  }


  static bind = (socket: socketIO.Socket) => {
    socket.on('cheer', (data) => {
      if(data.userId) {
        socket.join(data.userId)
        if(socket.rooms.has('cheer'))
          socket.leave('cheer')
        else
          socket.join('cheer')
      }
    })
  }

  static unbind = (socket: socketIO.Socket) => {

  }
}