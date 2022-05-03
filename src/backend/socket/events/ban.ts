import { EventSubChannelBanEvent, EventSubChannelUnbanEvent } from "@twurple/eventsub/lib"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"



export class BanHandler {

  static banEvent = async (event: EventSubChannelBanEvent) => {
    let data = toJSON(event)
    data.type = 'Ban'
    console.log(data)

    if(event.endDate)
      data.timeLeft = event.endDate.getTime() - Date.now()

    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
    }
  }

  static unbanEvent = async (event: EventSubChannelUnbanEvent) => {
    let data = toJSON(event)
    data.type = 'Unban'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
    }
  }

}