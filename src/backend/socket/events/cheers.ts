import { EventSubChannelCheerEvent } from "@twurple/eventsub/lib"
import { Socket } from "socket.io"

export class Cheers {

  static cheerEvent = (event: EventSubChannelCheerEvent) => {
    console.log(event)
    console.log(event.toJSON())
  }


  static bind = (socket: Socket) => {

  }

  static unbind = (socket: Socket) => {

  }
}