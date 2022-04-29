import { EventSubStreamOnlineEvent, EventSubStreamOfflineEvent } from "@twurple/eventsub/lib"
import { User } from "../../db/models/user"
import { Socket } from "../socket"
import { toJSON } from "./util/toJSON"

export class OnlineHandler {

    static onlineEvent = async (event: EventSubStreamOnlineEvent) => {
        let data = toJSON(event)
        data.type = 'Online'
        console.log(data)

        let found: any = await User.findOne({twitchId: event.broadcasterId})
        if(found)
            Socket.io.to(found._id.toString()).emit('events', data)
    }

    static offlineEvent = async (event: EventSubStreamOfflineEvent) => {
        let data = toJSON(event)
        data.type = 'Offline'
        console.log(data)

        let found: any = await User.findOne({twitchId: event.broadcasterId})
        if(found)
            Socket.io.to(found._id.toString()).emit('events', data)
    }

}