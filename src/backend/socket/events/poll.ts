import { EventSubChannelPollBeginEvent, EventSubChannelPollProgressEvent, EventSubChannelPollEndEvent } from "@twurple/eventsub/lib"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"



export class PollHandler {

  static pollBeginEvent = async (event: EventSubChannelPollBeginEvent) => {
    let data = toJSON(event)
    data.type = 'Poll Begin'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found) {
      Socket.io.to(found._id.toString()).emit('alerts', toJSON(event))
    }
  }
  
  static pollProgressEvent = async (event: EventSubChannelPollProgressEvent) => {
    let data = toJSON(event)
    data.type = 'Poll Progress'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found) {
      Socket.io.to(found._id.toString()).emit('alerts', toJSON(event))
    }
  }

  static pollEndEvent = async (event: EventSubChannelPollEndEvent) => {
    let data = toJSON(event)
    data.type = 'Poll End'
    console.log(data)

    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found) {
      Socket.io.to(found._id.toString()).emit('alerts', toJSON(event))
    }
  }
  
}