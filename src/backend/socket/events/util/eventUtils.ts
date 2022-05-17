import { getRawData, UserNameResolveableType } from '@twurple/common'
import { HelixUser } from '@twurple/api'
import { filter, from, take } from 'rxjs'
import { IUserInfo } from '../../../messages/categories/storeable'
import { Chat } from '../../../twitch/chat'
import { Twitch } from '../../../twitch/twitch'

export const toJSON = (event: any): any => {
  return getRawData(event)
}

export const getUserInfo = async (
  broadcaster: HelixUser | UserNameResolveableType | string,
  user: HelixUser | UserNameResolveableType | string,
  vip?: { vip }
): Promise<IUserInfo> => {
  try {
    let _broadcaster: HelixUser = broadcaster instanceof HelixUser ? broadcaster : await Twitch.client.users.getUserByName(broadcaster)
    let _user: HelixUser = user instanceof HelixUser ? user : await Twitch.client.users.getUserByName(user)

    let client = await from(Twitch.clients)
      .pipe(
        filter((c) => c.user.id === _broadcaster.id),
        take(1)
      )
      .toPromise()
    if (client) {
      let isVip = vip?.vip
      if (!vip) {
        let chatClient = await from(Chat.clients)
          .pipe(
            filter((c) => c.channel.replace(/\#/gi, '') === _broadcaster.name),
            take(1)
          )
          .toPromise()
        if (chatClient) isVip = chatClient.vips[_user.name]
      }
      return {
        mod: await client.userClient.moderation.checkUserMod(_broadcaster, _user),
        streamer: _broadcaster.id === _user.id,
        follower: (await client.userClient.users.getFollows({ user: _user, followedUser: _broadcaster })).data[0]?.followDate && true,
        sub: +(await client.userClient.subscriptions.getSubscriptionForUser(_broadcaster, _user))?.tier > 0,
        vip: isVip,
      }
    }
  } catch (e) {
    console.error(e)
  }
  return
}
