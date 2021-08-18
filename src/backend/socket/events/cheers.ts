import { EventSubChannelCheerEvent } from "@twurple/eventsub/lib"
import * as socketIO from "socket.io"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"

export class Cheers {

  static cheerEvent = async (event: EventSubChannelCheerEvent) => {
    console.log(toJSON(event))
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('cheer', toJSON(event))
  }


  static bind = (socket: socketIO.Socket) => {
/*     socket.on('cheer', (data) => {
      if(data.userId) {
        socket.join(data.userId)
      }
    }) */
  }

  static unbind = (socket: socketIO.Socket) => {

  }
}