import {
  EventSubChannelPredictionBeginEvent,
  EventSubChannelPredictionEndEvent,
  EventSubChannelPredictionLockEvent,
  EventSubChannelPredictionProgressEvent,
} from '@twurple/eventsub/lib'
import { User } from '../../db/models/user'
import { Socket } from '../socket'
import { toJSON } from './util/toJSON'

export class PredictionHandler {
  static predictionBeginEvent = async (event: EventSubChannelPredictionBeginEvent) => {
    let data = toJSON(event)
    data.type = 'Prediction Begin'
    console.log(data)

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
      Socket.io.to(found._id.toString()).emit('predictions', data)
    }
  }

  static predictionProgressEvent = async (event: EventSubChannelPredictionProgressEvent) => {
    let data = toJSON(event)
    data.type = 'Prediction Progress'
    console.log(data)

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
      Socket.io.to(found._id.toString()).emit('predictions', data)
    }
  }

  static predictionLockEvent = async (event: EventSubChannelPredictionLockEvent) => {
    let data = toJSON(event)
    data.type = 'Prediction Lock'
    console.log(data)

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
      Socket.io.to(found._id.toString()).emit('predictions', data)
    }
  }

  static predictionEndEvent = async (event: EventSubChannelPredictionEndEvent) => {
    let data = toJSON(event)
    data.type = 'Prediction End'
    console.log(data)

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', data)
      Socket.io.to(found._id.toString()).emit('predictions', data)
    }
  }
}
