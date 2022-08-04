import { EventSubStreamOnlineEvent, EventSubStreamOfflineEvent } from '@twurple/eventsub'
import { filter, from, take, tap } from 'rxjs'
import { User } from '../../db/models/user.model'
import { Chat } from '../../twitch/chat'
import { Socket } from '../socket'
import { toJSON } from './util/eventUtils'

export class OnlineHandler {
  static onlineEvent = async (event: EventSubStreamOnlineEvent) => {
    let data = toJSON(event)
    data.type = 'Online'

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) Socket.io.to(found._id.toString()).emit('alerts', data)

    from(Chat.clients).pipe(
      filter((i) => i.userId === found._id),
      take(1),
      tap((i) => {
        i.usersWhoTalked = []
      })
    )
  }

  static offlineEvent = async (event: EventSubStreamOfflineEvent) => {
    let data = toJSON(event)
    data.type = 'Offline'

    let found: any = await User.findOne({ twitchId: event.broadcasterId })
    if (found) Socket.io.to(found._id.toString()).emit('alerts', data)
  }
}
