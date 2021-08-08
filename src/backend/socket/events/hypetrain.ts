import { EventSubChannelHypeTrainBeginEvent, EventSubChannelHypeTrainEndEvent, EventSubChannelHypeTrainProgressEvent } from "@twurple/eventsub/lib"
import * as socketIO from "socket.io"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"

export class HypeTrain {

  static hypeTrainBegin = async (event: EventSubChannelHypeTrainBeginEvent) => {
    console.log(toJSON(event))
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit(found._id.toString(), Object.assign({eventName: 'start'}, toJSON(event)))
  }

  static hypeTrainProgress = async (event: EventSubChannelHypeTrainProgressEvent) => {
    console.log(toJSON(event))
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit(found._id.toString(), Object.assign({eventName: 'progress'}, toJSON(event)))
  }

  static hypeTrainEnd = async (event: EventSubChannelHypeTrainEndEvent) => {
    console.log(toJSON(event))
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit(found._id.toString(), Object.assign({eventName: 'end'}, toJSON(event)))
  }



  static bind = (socket: socketIO.Socket) => {
    socket.on('hypetrain', (data) => {
      if(data.userId) {
        socket.join(data.userId)
      }
    })
  }

  static unbind = (socket: socketIO.Socket) => {

  }
}