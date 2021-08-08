import { EventSubChannelPredictionBeginEvent, EventSubChannelPredictionEndEvent, EventSubChannelPredictionLockEvent, EventSubChannelPredictionProgressEvent } from "@twurple/eventsub/lib"
import { EventSubChannelPredictionBeginOutcome } from "@twurple/eventsub/lib/events/common/EventSubChannelPredictionBeginOutcome"
import * as socketIO from "socket.io"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"


export class Predictions {

  static predictionBeginEvent = (event: EventSubChannelPredictionBeginEvent) => {
    console.log(toJSON(event))
    Socket.io.to('prediction').emit('cheer', Object.assign({eventName: 'begin'}, toJSON(event)))
  }

  static predictionBeginOutcomeEvent = (event: EventSubChannelPredictionBeginOutcome) => {
    console.log(toJSON(event))
    Socket.io.to('prediction').emit('cheer', Object.assign({eventName: 'outcome'}, toJSON(event)))
  }

  static predictionLockEvent = (event: EventSubChannelPredictionLockEvent) => {
    console.log(toJSON(event))
    Socket.io.to('prediction').emit('cheer', Object.assign({eventName: 'lock'}, toJSON(event)))
  }

  static predictionEndEvent = (event: EventSubChannelPredictionEndEvent) => {
    console.log(toJSON(event))
    Socket.io.to('prediction').emit('cheer', Object.assign({eventName: 'end'}, toJSON(event)))
  }
  static predictionProgressEvent = (event: EventSubChannelPredictionProgressEvent) => {
    console.log(toJSON(event))
    Socket.io.to('prediction').emit('cheer', Object.assign({eventName: 'progress'}, toJSON(event)))
  }

  static bind = (socket: socketIO.Socket) => {
    socket.on('prediction', (data) => {
      if(data.userId) {
        socket.join(data.userId)
        if(socket.rooms.has('prediction'))
          socket.leave('prediction')
        else
          socket.join('prediction')
      }
    })
  }

  static unbind = (socket: socketIO.Socket) => {

  }
}