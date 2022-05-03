import { EventSubChannelRedemptionAddEvent, EventSubChannelRedemptionUpdateEvent } from "@twurple/eventsub/lib"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"

export class RedemptionHandler {

  static redemptionAddEvent = async (event: EventSubChannelRedemptionAddEvent) => {
    let data = toJSON(event)
    data.type = 'Redemption Add'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('alerts', data)
  }

  static redemptionUpdateEvent = async (event: EventSubChannelRedemptionUpdateEvent) => {
    let data = toJSON(event)
    data.type = 'Redemption Update'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('alerts', data)
  }

}