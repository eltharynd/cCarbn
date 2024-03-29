import {
  EventSubChannelPredictionBeginEvent,
  EventSubChannelPredictionEndEvent,
  EventSubChannelPredictionLockEvent,
  EventSubChannelPredictionProgressEvent,
} from '@twurple/eventsub'
import { User } from '../../db/models/user.model'
import { Socket } from '../socket'
import { toJSON } from './util/eventUtils'

export class PredictionHandler {
  static predictionBeginEvent = async (event: EventSubChannelPredictionBeginEvent) => {
    let data = toJSON(event)
    data.type = 'Prediction Begin'

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
      Socket.io.to(found._id.toString()).emit('predictions', data)
    }
  }

  static predictionProgressEvent = async (event: EventSubChannelPredictionProgressEvent) => {
    let data = toJSON(event)
    data.type = 'Prediction Progress'

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
      Socket.io.to(found._id.toString()).emit('predictions', data)
    }
  }

  static predictionLockEvent = async (event: EventSubChannelPredictionLockEvent) => {
    let data = toJSON(event)
    data.type = 'Prediction Lock'

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
      Socket.io.to(found._id.toString()).emit('predictions', data)
    }
  }

  static predictionEndEvent = async (event: EventSubChannelPredictionEndEvent) => {
    let data = toJSON(event)
    data.type = 'Prediction End'

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
      Socket.io.to(found._id.toString()).emit('predictions', data)
    }
  }
}
