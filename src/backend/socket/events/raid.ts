import { EventSubChannelRaidEvent } from "@twurple/eventsub/lib"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON, getUserInfo } from "./util/toJSON"



export class RaidHandler {

  static raidFromEvent = async (event: EventSubChannelRaidEvent) => {
    let data = toJSON(event)
    data.type = 'Raid From'
    data.userInfo = getUserInfo(await event.getRaidingBroadcaster())
    console.log(data)

    let found: any = await User.findOne({twitchId: event.raidedBroadcasterId})
    if(found) {
      Socket.io.to(found._id.toString()).emit('alerts', toJSON(event))
    }
  }
  
  static raidToEvent = async (event: EventSubChannelRaidEvent) => {
    let data = toJSON(event)
    data.type = 'Raid To'
    data.userInfo = getUserInfo(await event.getRaidedBroadcaster())
    console.log(data)

    let found: any = await User.findOne({twitchId: event.raidingBroadcasterId})
    if(found) {
      Socket.io.to(found._id.toString()).emit('alerts', toJSON(event))
    }
  }
  
}