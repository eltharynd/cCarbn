import { EventSubChannelCheerEvent } from '@twurple/eventsub'
import { User } from '../../db/models/user.model'
import { Socket } from '../socket'
import { toJSON, getUserInfo } from './util/eventUtils'

export class CheerHandler {
  static cheerEvent = async (event: EventSubChannelCheerEvent) => {
    let data = toJSON(event)
    data.type = 'Cheer'
    data.userInfo = getUserInfo(await event.getBroadcaster(), await event.getUser())

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
    }
  }
}
