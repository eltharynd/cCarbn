import { HelixUser } from '@twurple/api/lib'
import { EventSubChannelHypeTrainBeginEvent, EventSubChannelHypeTrainEndEvent, EventSubChannelHypeTrainProgressEvent } from '@twurple/eventsub/lib'
import { User } from '../../db/models/user'
import { Twitch } from '../../twitch/twitch'
import { Socket } from '../socket'
import { toJSON, getUserInfo } from './util/toJSON'

export class HypetrainHandler {
  static hypeTrainBegin = async (event: EventSubChannelHypeTrainBeginEvent) => {
    let data = toJSON(event)
    data.type = 'Hype Train Begin'

    if (data.last_contribution) {
      let helixUser: HelixUser | null = await Twitch.client.users.getUserById(data.last_contribution.user_id)
      if (helixUser) data.last_contribution.picture = helixUser.profilePictureUrl
    }
    if (data.top_contributions) {
      for (let u of data.top_contributions) {
        let helixUser: HelixUser | null = await Twitch.client.users.getUserById(u.user_id)
        if (helixUser) {
          u.picture = helixUser.profilePictureUrl
        }
      }
    }
    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
      Socket.io.to(found._id.toString()).emit('hypetrain', data)
    }
  }

  static hypeTrainProgress = async (event: EventSubChannelHypeTrainProgressEvent) => {
    let data = toJSON(event)
    data.type = 'Hype Train Progress'
    data.userInfo = getUserInfo(await event.lastContribution.getUser())

    if (data.last_contribution) {
      let helixUser: HelixUser | null = await Twitch.client.users.getUserById(data.last_contribution.user_id)
      if (helixUser) data.last_contribution.picture = helixUser.profilePictureUrl
    }
    if (data.top_contributions) {
      for (let u of data.top_contributions) {
        let helixUser: HelixUser | null = await Twitch.client.users.getUserById(u.user_id)
        if (helixUser) u.picture = helixUser.profilePictureUrl
      }
    }
    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found)
      setTimeout(() => {
        Socket.io.to(found._id.toString()).emit('alerts', data)
        Socket.io.to(found._id.toString()).emit('hypetrain', data)
      }, 1000)
  }

  static hypeTrainEnd = async (event: EventSubChannelHypeTrainEndEvent) => {
    let data = toJSON(event)
    data.type = 'Hype Train End'

    if (data.last_contribution) {
      let helixUser: HelixUser | null = await Twitch.client.users.getUserById(data.last_contribution.user_id)
      if (helixUser) data.last_contribution.picture = helixUser.profilePictureUrl
    }
    if (data.top_contributions) {
      for (let u of data.top_contributions) {
        let helixUser: HelixUser | null = await Twitch.client.users.getUserById(u.user_id)
        if (helixUser) u.picture = helixUser.profilePictureUrl
      }
    }
    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found)
      setTimeout(() => {
        Socket.io.to(found._id.toString()).emit('alerts', data)
        Socket.io.to(found._id.toString()).emit('hypetrain', data)
      }, 1000)
  }
}
