import { HelixUser } from "@twurple/api/lib"
import { EventSubChannelHypeTrainBeginEvent, EventSubChannelHypeTrainEndEvent, EventSubChannelHypeTrainProgressEvent } from "@twurple/eventsub/lib"
import * as socketIO from "socket.io"
import { Api } from "../../api/express"
import { User } from "../../db/models/user"
import { Twitch } from "../../twitch/twitch"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"

export class HypeTrain {

  static hypeTrainBegin = async (event: EventSubChannelHypeTrainBeginEvent) => {
    Api.eventsCollection.push({
      type: 'Hype Train Begin',
      time: Date.now(),
      event: toJSON(event)
    })
    console.log(toJSON(event))
    let data = toJSON(event)
    data.type = 'Hype Train Begin'
    if(data.last_contribution) {
      let helixUser: HelixUser = await Twitch.client.users.getUserById(data.last_contribution.user_id)
      if(helixUser) 
        data.last_contribution.picture = helixUser.profilePictureUrl
    }
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit(found._id.toString(), data)
  }

  static hypeTrainProgress = async (event: EventSubChannelHypeTrainProgressEvent) => {
    Api.eventsCollection.push({
      type: 'Hype Train Progress',
      time: Date.now(),
      event: toJSON(event)
    })
    console.log(toJSON(event))
    let data = toJSON(event)
    data.type = 'Hype Train Progress'
    if(data.last_contribution) {
      let helixUser: HelixUser = await Twitch.client.users.getUserById(data.last_contribution.user_id)
      if(helixUser) 
        data.last_contribution.picture = helixUser.profilePictureUrl
    }
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit(found._id.toString(), data)
  }

  static hypeTrainEnd = async (event: EventSubChannelHypeTrainEndEvent) => {
    Api.eventsCollection.push({
      type: 'Hype Train End',
      time: Date.now(),
      event: toJSON(event)
    })
    console.log(toJSON(event))
    let data = toJSON(event)
    data.type = 'Hype Train End'
    if(data.last_contribution) {
      let helixUser: HelixUser = await Twitch.client.users.getUserById(data.last_contribution.user_id)
      if(helixUser) 
        data.last_contribution.picture = helixUser.profilePictureUrl
    }
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit(found._id.toString(), data)
  }



  static bind = (socket: socketIO.Socket) => {
/*     socket.on('hypetrain', (data) => {
      if(data.userId) {
        socket.join(data.userId)
      }
    }) */
  }

  static unbind = (socket: socketIO.Socket) => {

  }
}