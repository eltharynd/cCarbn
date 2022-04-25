import { EventSubChannelCheerEvent } from "@twurple/eventsub/lib"
import { User } from "../../db/models/user"
import * as socketIO from "socket.io"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"



export class Cheers {

  static cheerEvent = async (event: EventSubChannelCheerEvent) => {
    console.info(toJSON(event))
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found) {
      Socket.io.to(found._id.toString()).emit('events', toJSON(event))
    }
  }
}