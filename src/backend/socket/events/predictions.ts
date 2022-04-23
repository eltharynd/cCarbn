import { EventSubChannelPredictionBeginEvent, EventSubChannelPredictionEndEvent, EventSubChannelPredictionLockEvent, EventSubChannelPredictionProgressEvent } from "@twurple/eventsub/lib"
import { EventSubChannelPredictionBeginOutcome } from "@twurple/eventsub/lib/events/common/EventSubChannelPredictionBeginOutcome"
import * as socketIO from "socket.io"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"

export class Predictions {

  static predictionBeginEvent = async (event: EventSubChannelPredictionBeginEvent) => {
    console.log(toJSON(event))
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('cheer', Object.assign({eventName: 'begin'}, toJSON(event)))
  }

  static predictionBeginOutcomeEvent = async (event: EventSubChannelPredictionBeginOutcome) => {
    console.log(toJSON(event))
    /* let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('cheer', Object.assign({eventName: 'outcome'}, toJSON(event))) */
  }

  static predictionLockEvent = async (event: EventSubChannelPredictionLockEvent) => {
    console.log(toJSON(event))
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('cheer', Object.assign({eventName: 'lock'}, toJSON(event)))
  }

  static predictionEndEvent = async (event: EventSubChannelPredictionEndEvent) => {
    console.log(toJSON(event))
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('cheer', Object.assign({eventName: 'end'}, toJSON(event)))
  }

  static predictionProgressEvent = async (event: EventSubChannelPredictionProgressEvent) => {
    console.log(toJSON(event))
    let found: any = await User.findOne({twitchId: event.broadcasterId})
    if(found)
      Socket.io.to(found._id.toString()).emit('cheer', Object.assign({eventName: 'progress'}, toJSON(event)))
  }
}