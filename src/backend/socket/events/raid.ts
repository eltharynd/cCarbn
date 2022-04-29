import { EventSubChannelRaidEvent } from "@twurple/eventsub/lib"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"



export class RaidHandler {

  static raidFromEvent = async (event: EventSubChannelRaidEvent) => {
    let data = toJSON(event)
    data.type = 'Raid From'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.raidedBroadcasterId})
    if(found) {
      Socket.io.to(found._id.toString()).emit('events', toJSON(event))
    }
  }
  
  static raidToEvent = async (event: EventSubChannelRaidEvent) => {
    let data = toJSON(event)
    data.type = 'Raid To'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.raidingBroadcasterId})
    if(found) {
      Socket.io.to(found._id.toString()).emit('events', toJSON(event))
    }
  }
  
}