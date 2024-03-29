import { EventSubChannelPollBeginEvent, EventSubChannelPollProgressEvent, EventSubChannelPollEndEvent } from '@twurple/eventsub'
import { User } from '../../db/models/user.model'
import { Socket } from '../socket'
import { toJSON } from './util/eventUtils'

export class PollHandler {
  static pollBeginEvent = async (event: EventSubChannelPollBeginEvent) => {
    let data = toJSON(event)
    data.type = 'Poll Begin'

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
    }
  }

  static pollProgressEvent = async (event: EventSubChannelPollProgressEvent) => {
    let data = toJSON(event)
    data.type = 'Poll Progress'
    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
    }
  }

  static pollEndEvent = async (event: EventSubChannelPollEndEvent) => {
    let data = toJSON(event)
    data.type = 'Poll End'

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
    }
  }
}
