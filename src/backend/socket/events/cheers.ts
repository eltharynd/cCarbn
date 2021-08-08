import { EventSubChannelCheerEvent } from "@twurple/eventsub/lib"
import * as socketIO from "socket.io"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"

export class Cheers {

  static cheerEvent = (event: EventSubChannelCheerEvent) => {
    console.log(toJSON(event))
    Socket.io.to('hypetrain').emit('hypetrain', Object.assign({eventName: 'start'}, toJSON(event)))
  }


  static bind = (socket: socketIO.Socket) => {
    socket.on('cheers', (data) => {
      if(socket.rooms.has('cheers'))
        socket.leave('cheers')
      else
        socket.join('cheers')
    })
  }

  static unbind = (socket: socketIO.Socket) => {

  }
}