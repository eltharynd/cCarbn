import { EventSubChannelFollowEvent } from "@twurple/eventsub/lib"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"



export class FollowHandler {

  static followEvent = async (event: EventSubChannelFollowEvent) => {
    let data = toJSON(event)
    data.type = 'Follow'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found) {
      Socket.io.to(found._id.toString()).emit('events', toJSON(event))
    }
  }
  
}