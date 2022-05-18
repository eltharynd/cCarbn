import { EventSubChannelBanEvent, EventSubChannelUnbanEvent } from '@twurple/eventsub/lib'
import { User } from '../../db/models/user.model'
import { Socket } from '../socket'
import { toJSON, getUserInfo } from './util/eventUtils'

export class BanHandler {
  static banEvent = async (event: EventSubChannelBanEvent) => {
    let data = toJSON(event)
    data.type = 'Ban'
    data.userInfo = getUserInfo(await event.getBroadcaster(), await event.getUser())

    if (event.endDate) data.timeLeft = event.endDate.getTime() - Date.now()

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
    }
  }

  static unbanEvent = async (event: EventSubChannelUnbanEvent) => {
    let data = toJSON(event)
    data.type = 'Unban'
    data.userInfo = getUserInfo(await event.getBroadcaster(), await event.getUser())

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
    }
  }
}
