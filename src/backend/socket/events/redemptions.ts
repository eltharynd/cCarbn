import { EventSubChannelRewardEvent } from "@twurple/eventsub/lib/events/EventSubChannelRewardEvent"
import { EventSubChannelRedemptionAddEvent } from "@twurple/eventsub/lib/events/EventSubChannelRedemptionAddEvent"
import * as socketIO from "socket.io"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"

export class Redemptions {


  static redemptionEvent = async (event: EventSubChannelRedemptionAddEvent) => {
    console.log(toJSON(event))
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('redemption', toJSON(event))
  }
}