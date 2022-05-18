import { EventSubChannelModeratorEvent } from '@twurple/eventsub/lib'
import { User } from '../../db/models/user.model'
import { Socket } from '../socket'
import { toJSON } from './util/eventUtils'

export class ModeratorHandler {
  static moderatorAddEvent = async (event: EventSubChannelModeratorEvent) => {
    let data = toJSON(event)
    data.type = 'Moderator Add'

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
    }
  }

  static moderatorRemoveEvent = async (event: EventSubChannelModeratorEvent) => {
    let data = toJSON(event)
    data.type = 'Moderator Remove'

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
    }
  }
}
