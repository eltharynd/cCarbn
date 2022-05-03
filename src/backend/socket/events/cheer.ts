import { EventSubChannelCheerEvent } from "@twurple/eventsub/lib"
import { User } from "../../db/models/user"
import * as socketIO from "socket.io"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"



export class CheerHandler {

  static cheerEvent = async (event: EventSubChannelCheerEvent) => {
    let data = toJSON(event)
    data.type = 'Cheer'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
    }
  }
  
}