import { EventSubChannelSubscriptionEvent, EventSubChannelSubscriptionEndEvent, EventSubChannelSubscriptionGiftEvent, EventSubChannelSubscriptionMessageEvent} from "@twurple/eventsub/lib"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"

export class SubscriptionHandler {

    
    static subscriptionEvent = async (event: EventSubChannelSubscriptionEvent) => {
        let data = toJSON(event)
        data.type = 'Subscription'
        console.log(data)

        let found: any = await User.findOne({twitchId: event.broadcasterId})
        if(found)
            Socket.io.to(found._id.toString()).emit('events', data)
    }

    static subscriptionEndEvent = async (event: EventSubChannelSubscriptionEndEvent) => {
        let data = toJSON(event)
        data.type = 'Subscription End'
        console.log(data)

        let found: any = await User.findOne({twitchId: event.broadcasterId})
        if(found)
            Socket.io.to(found._id.toString()).emit('events', data)
    }

    static subscriptionGiftEvent = async (event: EventSubChannelSubscriptionGiftEvent) => {
        let data = toJSON(event)
        data.type = 'Subscription Gift'
        console.log(data)

        let found: any = await User.findOne({twitchId: event.broadcasterId})
        if(found)
            Socket.io.to(found._id.toString()).emit('events', data)
    }

    static subscriptionMessageEvent = async (event: EventSubChannelSubscriptionMessageEvent) => {
        let data = toJSON(event)
        data.type = 'Subscription Message'
        console.log(data)

        let found: any = await User.findOne({twitchId: event.broadcasterId})
        if(found)
            Socket.io.to(found._id.toString()).emit('events', data)
    }

}