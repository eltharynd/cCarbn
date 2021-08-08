import { EventSubChannelHypeTrainBeginEvent, EventSubChannelHypeTrainEndEvent, EventSubChannelHypeTrainProgressEvent } from "@twurple/eventsub/lib"
import * as socketIO from "socket.io"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"

export class HypeTrain {

  static hypeTrainBegin = (event: EventSubChannelHypeTrainBeginEvent) => {
    console.log(toJSON(event))
    Socket.io.to('hypetrain').emit('hypetrain', Object.assign({eventName: 'start'}, toJSON(event)))
  }

  static hypeTrainProgress = (event: EventSubChannelHypeTrainProgressEvent) => {
    console.log(toJSON(event))
    Socket.io.to('hypetrain').emit('hypetrain', Object.assign({eventName: 'progress'}, toJSON(event)))
  }

  static hypeTrainEnd = (event: EventSubChannelHypeTrainEndEvent) => {
    console.log(toJSON(event))
    Socket.io.to('hypetrain').emit('hypetrain', Object.assign({eventName: 'end'}, toJSON(event)))
  }



  static bind = (socket: socketIO.Socket) => {
    socket.on('hypetrain', (data) => {

      if(socket.rooms.has('hypetrain'))
        socket.leave('hypetrain')
      else
        socket.join('hypetrain')
    })
  }

  static unbind = (socket: socketIO.Socket) => {

  }
}