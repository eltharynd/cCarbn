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
      let helixUser: HelixUser|null = await Twitch.client.users.getUserById(data.last_contribution.user_id)
      if(helixUser)
        data.last_contribution.picture = helixUser.profilePictureUrl
    }
    if(data.top_contributions) {
      for(let u of data.top_contributions) {
        let helixUser: HelixUser|null = await Twitch.client.users.getUserById(u.user_id)
        if(helixUser) {
          u.picture = helixUser.profilePictureUrl
          Api.eventsCollection.push({ top_contributions_picture: u.picture })
        }
      }  
    }
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('hypetrain', data)
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
      let helixUser: HelixUser|null = await Twitch.client.users.getUserById(data.last_contribution.user_id)
      if(helixUser)
        data.last_contribution.picture = helixUser.profilePictureUrl
    }
    if(data.top_contributions) {
      for(let u of data.top_contributions) {
        let helixUser: HelixUser|null = await Twitch.client.users.getUserById(u.user_id)
        if(helixUser)
          u.picture = helixUser.profilePictureUrl
      }  
    }
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      setTimeout(() => {
        Socket.io.to(found._id.toString()).emit('hypetrain', data)
      }, 1000); 
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
      let helixUser: HelixUser|null = await Twitch.client.users.getUserById(data.last_contribution.user_id)
      if(helixUser)
        data.last_contribution.picture = helixUser.profilePictureUrl
    }
    if(data.top_contributions) {
      for(let u of data.top_contributions) {
        let helixUser: HelixUser|null = await Twitch.client.users.getUserById(u.user_id)
        if(helixUser)
          u.picture = helixUser.profilePictureUrl
      }  
    }
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      setTimeout(() => {
        Socket.io.to(found._id.toString()).emit('hypetrain', data)
      }, 1000);
      
  }

}