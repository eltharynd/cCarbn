import { EventSubChannelRewardEvent } from "@twurple/eventsub/lib"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"

export class RewardHandler {

  static rewardAddEvent = async (event: EventSubChannelRewardEvent) => {
    let data = toJSON(event)
    data.type = 'Reward Add'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('alerts', data)
  }

  static rewardRemoveEvent = async (event: EventSubChannelRewardEvent) => {
    let data = toJSON(event)
    data.type = 'Reward Remove'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('alerts', data)
  }

  static rewardUpdateEvent = async (event: EventSubChannelRewardEvent) => {
    let data = toJSON(event)
    data.type = 'Reward Update'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('alerts', data)
  }

}