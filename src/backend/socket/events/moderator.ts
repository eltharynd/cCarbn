import { EventSubChannelModeratorEvent } from '@twurple/eventsub/lib'
import { User } from '../../db/models/user'
import { Socket } from '../socket'
import { toJSON } from './util/toJSON'

export class ModeratorHandler {
  static moderatorAddEvent = async (event: EventSubChannelModeratorEvent) => {
    let data = toJSON(event)
    data.type = 'Moderator Add'
    console.log(data)

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', toJSON(event))
    }
  }

  static moderatorRemoveEvent = async (event: EventSubChannelModeratorEvent) => {
    let data = toJSON(event)
    data.type = 'Moderator Remove'
    console.log(data)

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', toJSON(event))
    }
  }
}
