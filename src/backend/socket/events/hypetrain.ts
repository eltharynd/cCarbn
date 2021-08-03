import { EventSubChannelHypeTrainBeginEvent, EventSubChannelHypeTrainEndEvent, EventSubChannelHypeTrainProgressEvent } from "@twurple/eventsub/lib"
import * as socketIO from "socket.io"
import { Socket } from "../socket"

export class HypeTrain {

  static hypeTrainBegin = (event: EventSubChannelHypeTrainBeginEvent) => {
    console.log(event)
    Socket.io.to('hypetrain').emit('hypetrain', Object.assign({eventName: 'start'}, event))
  }

  static hypeTrainProgress = (event: EventSubChannelHypeTrainProgressEvent) => {
    console.log(event)
    Socket.io.to('hypetrain').emit('hypetrain', Object.assign({eventName: 'progress'}, event))
  }

  static hypeTrainEnd = (event: EventSubChannelHypeTrainEndEvent) => {
    console.log(event)
    Socket.io.to('hypetrain').emit('hypetrain', Object.assign({eventName: 'end'}, event))
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