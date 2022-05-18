import { HelixClip } from '@twurple/api/lib'
import { EventSubChannelRaidEvent } from '@twurple/eventsub/lib'
import { filter, from, take } from 'rxjs'
import { User } from '../../db/models/user.model'
import { Twitch } from '../../twitch/twitch'
import { Socket } from '../socket'
import { toJSON, getUserInfo } from './util/eventUtils'

export class RaidHandler {
  static raidFromEvent = async (event: EventSubChannelRaidEvent) => {
    let data = toJSON(event)
    data.type = 'Raid From'
    data.userInfo = getUserInfo(await event.getRaidedBroadcaster(), await event.getRaidingBroadcaster())

    try {
      let alertData: any = {
        channel: (await Twitch.client.search.searchChannels(data.from_broadcaster_user_id)).data,
      }
      alertData.channel = await from(alertData.channel)
        .pipe(
          filter((channel: any) => channel.name === data.from_broadcaster_user_id),
          take(1)
        )
        .toPromise()
      if (alertData.channel) {
        alertData.clips = (await Twitch.client.clips.getClipsForBroadcaster(alertData.channel.id)).data
        alertData.randomClip = alertData.clips[Math.floor(Math.random() * alertData.clips.length)]
        alertData.topClip = { views: -1 }
        for (let c of alertData.clips) {
          let clip: HelixClip = c
          clip.views > alertData.topClip.views
          alertData.topClip = clip
        }

        if (alertData.topClip.views < 0) delete alertData.topClip

        if (alertData.channel) alertData.channel = toJSON(alertData.channel)
        if (alertData.clips) alertData.clips = toJSON(alertData.clips)
        if (alertData.stream) alertData.stream = toJSON(alertData.stream)
        if (alertData.randomClip) alertData.randomClip = toJSON(alertData.randomClip)
        if (alertData.topClip) alertData.topClip = toJSON(alertData.topClip)

        data.alertData = alertData
      }
    } catch (e) {
      console.error(e)
    }

    let found: any = await User.findOne({ twitchId: event.raidedBroadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', toJSON(event))
    }
  }

  static raidToEvent = async (event: EventSubChannelRaidEvent) => {
    let data = toJSON(event)
    data.type = 'Raid To'
    data.userInfo = getUserInfo(await event.getRaidingBroadcaster(), await event.getRaidedBroadcaster())

    let found: any = await User.findOne({ twitchId: event.raidingBroadcasterId })
    if (found) {
      Socket.io.to(found._id.toString()).emit('alerts', toJSON(event))
    }
  }
}
