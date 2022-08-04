import { EventSubChannelRedemptionAddEvent, EventSubChannelRedemptionUpdateEvent } from '@twurple/eventsub'
import { User } from '../../db/models/user.model'
import { Socket } from '../socket'
import { toJSON, getUserInfo } from './util/eventUtils'

export class RedemptionHandler {
  static redemptionAddEvent = async (event: EventSubChannelRedemptionAddEvent) => {
    let data = toJSON(event)
    data.type = 'Redemption Add'
    data.userInfo = getUserInfo(await event.getBroadcaster(), await event.getUser())

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) Socket.io.to(found._id.toString()).emit('alerts', data)
  }

  static redemptionUpdateEvent = async (event: EventSubChannelRedemptionUpdateEvent) => {
    let data = toJSON(event)
    data.type = 'Redemption Update'
    data.userInfo = getUserInfo(await event.getBroadcaster(), await event.getUser())

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) Socket.io.to(found._id.toString()).emit('alerts', data)
  }
}
