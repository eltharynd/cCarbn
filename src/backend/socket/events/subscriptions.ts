import {
  EventSubChannelSubscriptionEvent,
  EventSubChannelSubscriptionEndEvent,
  EventSubChannelSubscriptionGiftEvent,
  EventSubChannelSubscriptionMessageEvent,
} from '@twurple/eventsub/lib'
import { User } from '../../db/models/user'
import { Socket } from '../socket'
import { toJSON, getUserInfo } from './util/eventUtils'

export class SubscriptionHandler {
  static subscriptionEvent = async (event: EventSubChannelSubscriptionEvent) => {
    let data = toJSON(event)
    data.type = 'Subscription'
    data.userInfo = getUserInfo(await event.getBroadcaster(), await event.getUser())

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) Socket.io.to(found._id.toString()).emit('alerts', data)
  }

  static subscriptionEndEvent = async (event: EventSubChannelSubscriptionEndEvent) => {
    let data = toJSON(event)
    data.type = 'Subscription End'
    data.userInfo = getUserInfo(await event.getBroadcaster(), await event.getUser())

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) Socket.io.to(found._id.toString()).emit('alerts', data)
  }

  static subscriptionGiftEvent = async (event: EventSubChannelSubscriptionGiftEvent) => {
    let data = toJSON(event)
    data.type = 'Subscription Gift'
    data.userInfo = getUserInfo(await event.getBroadcaster(), await event.getGifter())

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) Socket.io.to(found._id.toString()).emit('alerts', data)
  }

  static subscriptionMessageEvent = async (event: EventSubChannelSubscriptionMessageEvent) => {
    let data = toJSON(event)
    data.type = 'Subscription Message'
    data.userInfo = getUserInfo(await event.getBroadcaster(), await event.getUser())

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) Socket.io.to(found._id.toString()).emit('alerts', data)
  }
}
