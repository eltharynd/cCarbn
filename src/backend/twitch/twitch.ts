import { ApiClient, HelixChannelSearchResult, HelixStream, HelixUser } from '@twurple/api'
import { DirectConnectionAdapter, EventSubListener, EventSubSubscription, ReverseProxyAdapter } from '@twurple/eventsub'
import { from, Subject } from 'rxjs'
import * as fs from 'fs'
import { filter, take, toArray } from 'rxjs/operators'

import { ClientCredentialsAuthProvider, RefreshingAuthProvider } from '@twurple/auth'
import { Mongo } from '../db/mongo'
import { UserToken, ClientToken } from '../db/models/tokens.model'
import { User } from '../db/models/user.model'
import { PORT } from '../index'

import { BanHandler } from '../socket/events/ban.event'
import { CheerHandler } from '../socket/events/cheer.event'
import { FollowHandler } from '../socket/events/follow.event'
import { HypetrainHandler } from '../socket/events/hypetrain.event'
import { ModeratorHandler } from '../socket/events/moderator.event'
import { PollHandler } from '../socket/events/poll.event'
import { PredictionHandler } from '../socket/events/prediction.event'
import { RaidHandler } from '../socket/events/raid.event'
import { RedemptionHandler } from '../socket/events/redemption.event'
import { RewardHandler } from '../socket/events/reward.event'
import { SubscriptionHandler } from '../socket/events/subscriptions.event'
import { UpdateHandler } from '../socket/events/update.event'
import { OnlineHandler } from '../socket/events/online.event'

export const DEV_ENDPOINT = JSON.parse('' + fs.readFileSync('endpoint_credentials.json'))
const FORCE_REVERSE_PROXY = true
export class Twitch {
  static client: ApiClient
  static listener: EventSubListener
  static clientReady: Subject<any>
  static clients: IApiClient[] = []

  static async findByUserId(userId) {
    return await from(Twitch.clients)
      .pipe(filter((c) => c.userId.toString() === userId.toString()))
      .toPromise()
  }

  static async findByChannel(channel: HelixUser) {
    let user: any = await User.findOne({ twitchId: channel.id.toString() })
    return await from(Twitch.clients)
      .pipe(filter((c) => c.userId.toString() === user._id.toString()))
      .toPromise()
  }

  static async prepareClient() {
    Twitch.client = new ApiClient({
      authProvider: new ClientCredentialsAuthProvider(Mongo.clientId, Mongo.clientSecret),
    })
    let token: any = await ClientToken.findOne()
    await Twitch.client.eventSub.deleteAllSubscriptions()
    Twitch.listener = new EventSubListener({
      apiClient: Twitch.client,
      adapter:
        FORCE_REVERSE_PROXY || process?.env?.NODE_ENV === 'production'
          ? new ReverseProxyAdapter({
              hostName: DEV_ENDPOINT.hostname,
              port: +PORT + 1,
              pathPrefix: 'listener',
            })
          : new DirectConnectionAdapter({
              hostName: DEV_ENDPOINT.hostname,
              sslCert: {
                cert: `${fs.readFileSync(DEV_ENDPOINT.crt)}`,
                key: `${fs.readFileSync(DEV_ENDPOINT.key)}`,
              },
            }),
      secret: token.secret,
      strictHostCheck: false, //TODO check for production
    })
    //@ts-ignore
    await Twitch.listener.listen(FORCE_REVERSE_PROXY || process?.env?.NODE_ENV === 'production' ? null : +PORT + 1)
  }

  static async init() {
    if (!Twitch.client) {
      if (Twitch.clientReady) await Twitch.clientReady.toPromise()
      else Twitch.clientReady = new Subject()

      await this.prepareClient()
      Twitch.clientReady.complete()
    }
  }

  static async connect(user, settings?) {
    await Twitch.init()

    if (await this.findByUserId(user._id)) throw new Error()

    let token: any = await UserToken.findOne({ userId: user._id })
    let userClient = new ApiClient({
      authProvider: new RefreshingAuthProvider(
        {
          clientId: Mongo.clientId,
          clientSecret: Mongo.clientSecret,
          onRefresh: async (token) => {
            let userToken: any = await UserToken.findOne({ userId: user._id })
            userToken.accessToken = token.accessToken
            userToken.refreshToken = token.refreshToken
            userToken.expiresIn = token.expiresIn
            userToken.obtainmentTimestamp = Date.now()
            await userToken.save()
          },
        },
        token.toJSON()
      ),
    })

    let channel = await Twitch.client.users.getUserByName(user.twitchName)
    if (!channel) return console.error(`Channel not found for user: ${user._id} when trying to connect twitch API.`)

    let subscriptions = await Twitch.bindListeners(channel, settings)

    let iClient = Object.assign(new IApiClient(), {
      userId: user._id,
      user: channel,
      client: Twitch.client,
      userClient: userClient,
      listener: Twitch.listener,
      subscriptions: subscriptions,
    })
    Twitch.clients.push(iClient)
  }

  static async disconnect(user, settings?) {
    let iClient = await this.findByUserId(user._id)
    if (iClient?.subscriptions) {
      for (let sub of iClient.subscriptions) {
        sub.subscription.stop()
      }
      iClient.subscriptions = null
      Twitch.clients.splice(Twitch.clients.indexOf(iClient), 1)
    }
  }

  static async bindListeners(channel: HelixUser, settings) {
    let subscriptions: { listener: Listeners; subscription: EventSubSubscription }[] = []
    if (settings?.api?.listeners?.ban?.enabled) {
      subscriptions.push({ listener: Listeners.ban, subscription: await Twitch.listener.subscribeToChannelBanEvents(channel.id, BanHandler.banEvent) })
      subscriptions.push({ listener: Listeners.ban, subscription: await Twitch.listener.subscribeToChannelUnbanEvents(channel.id, BanHandler.unbanEvent) })
    }
    if (settings?.api?.listeners?.cheer?.enabled) {
      subscriptions.push({ listener: Listeners.cheer, subscription: await Twitch.listener.subscribeToChannelCheerEvents(channel.id, CheerHandler.cheerEvent) })
    }
    if (settings?.api?.listeners?.follow?.enabled) {
      subscriptions.push({ listener: Listeners.follow, subscription: await Twitch.listener.subscribeToChannelFollowEvents(channel.id, FollowHandler.followEvent) })
    }
    if (settings?.api?.listeners?.hypetrain?.enabled) {
      subscriptions.push({ listener: Listeners.hypetrain, subscription: await Twitch.listener.subscribeToChannelHypeTrainBeginEvents(channel.id, HypetrainHandler.hypeTrainBegin) })
      subscriptions.push({
        listener: Listeners.hypetrain,
        subscription: await Twitch.listener.subscribeToChannelHypeTrainProgressEvents(channel.id, HypetrainHandler.hypeTrainProgress),
      })
      subscriptions.push({ listener: Listeners.hypetrain, subscription: await Twitch.listener.subscribeToChannelHypeTrainEndEvents(channel.id, HypetrainHandler.hypeTrainEnd) })
    }
    if (settings?.api?.listeners?.moderator?.enabled) {
      subscriptions.push({
        listener: Listeners.moderator,
        subscription: await Twitch.listener.subscribeToChannelModeratorAddEvents(channel.id, ModeratorHandler.moderatorAddEvent),
      })
      subscriptions.push({
        listener: Listeners.moderator,
        subscription: await Twitch.listener.subscribeToChannelModeratorRemoveEvents(channel.id, ModeratorHandler.moderatorRemoveEvent),
      })
    }
    if (settings?.api?.listeners?.poll?.enabled) {
      subscriptions.push({ listener: Listeners.poll, subscription: await Twitch.listener.subscribeToChannelPollBeginEvents(channel.id, PollHandler.pollBeginEvent) })
      subscriptions.push({ listener: Listeners.poll, subscription: await Twitch.listener.subscribeToChannelPollProgressEvents(channel.id, PollHandler.pollProgressEvent) })
      subscriptions.push({ listener: Listeners.poll, subscription: await Twitch.listener.subscribeToChannelPollEndEvents(channel.id, PollHandler.pollEndEvent) })
    }
    if (settings?.api?.listeners?.prediction?.enabled) {
      subscriptions.push({
        listener: Listeners.prediction,
        subscription: await Twitch.listener.subscribeToChannelPredictionBeginEvents(channel.id, PredictionHandler.predictionBeginEvent),
      })
      subscriptions.push({
        listener: Listeners.prediction,
        subscription: await Twitch.listener.subscribeToChannelPredictionProgressEvents(channel.id, PredictionHandler.predictionProgressEvent),
      })
      subscriptions.push({
        listener: Listeners.prediction,
        subscription: await Twitch.listener.subscribeToChannelPredictionLockEvents(channel.id, PredictionHandler.predictionLockEvent),
      })
      subscriptions.push({
        listener: Listeners.prediction,
        subscription: await Twitch.listener.subscribeToChannelPredictionEndEvents(channel.id, PredictionHandler.predictionEndEvent),
      })
    }
    if (settings?.api?.listeners?.raid?.enabled) {
      subscriptions.push({ listener: Listeners.raid, subscription: await Twitch.listener.subscribeToChannelRaidEventsFrom(channel.id, RaidHandler.raidOutgoingEvent) })
      subscriptions.push({ listener: Listeners.raid, subscription: await Twitch.listener.subscribeToChannelRaidEventsTo(channel.id, RaidHandler.raidIncomingEvent) })
    }
    if (settings?.api?.listeners?.redemption?.enabled) {
      subscriptions.push({
        listener: Listeners.redemption,
        subscription: await Twitch.listener.subscribeToChannelRedemptionAddEvents(channel.id, RedemptionHandler.redemptionAddEvent),
      })
      subscriptions.push({
        listener: Listeners.redemption,
        subscription: await Twitch.listener.subscribeToChannelRedemptionUpdateEvents(channel.id, RedemptionHandler.redemptionUpdateEvent),
      })
    }
    if (settings?.api?.listeners?.reward?.enabled) {
      subscriptions.push({ listener: Listeners.reward, subscription: await Twitch.listener.subscribeToChannelRewardAddEvents(channel.id, RewardHandler.rewardAddEvent) })
      subscriptions.push({ listener: Listeners.reward, subscription: await Twitch.listener.subscribeToChannelRewardRemoveEvents(channel.id, RewardHandler.rewardRemoveEvent) })
      subscriptions.push({ listener: Listeners.reward, subscription: await Twitch.listener.subscribeToChannelRewardUpdateEvents(channel.id, RewardHandler.rewardUpdateEvent) })
    }
    if (settings?.api?.listeners?.subscription?.enabled) {
      subscriptions.push({
        listener: Listeners.subscription,
        subscription: await Twitch.listener.subscribeToChannelSubscriptionEvents(channel.id, SubscriptionHandler.subscriptionEvent),
      })
      subscriptions.push({
        listener: Listeners.subscription,
        subscription: await Twitch.listener.subscribeToChannelSubscriptionEndEvents(channel.id, SubscriptionHandler.subscriptionEndEvent),
      })
      subscriptions.push({
        listener: Listeners.subscription,
        subscription: await Twitch.listener.subscribeToChannelSubscriptionGiftEvents(channel.id, SubscriptionHandler.subscriptionGiftEvent),
      })
      subscriptions.push({
        listener: Listeners.subscription,
        subscription: await Twitch.listener.subscribeToChannelSubscriptionMessageEvents(channel.id, SubscriptionHandler.subscriptionMessageEvent),
      })
    }
    if (settings?.api?.listeners?.update?.enabled) {
      subscriptions.push({ listener: Listeners.update, subscription: await Twitch.listener.subscribeToChannelUpdateEvents(channel.id, UpdateHandler.updateEvent) })
    }
    if (settings?.api?.listeners?.live?.enabled) {
      subscriptions.push({ listener: Listeners.online, subscription: await Twitch.listener.subscribeToStreamOnlineEvents(channel.id, OnlineHandler.onlineEvent) })
      subscriptions.push({ listener: Listeners.online, subscription: await Twitch.listener.subscribeToStreamOfflineEvents(channel.id, OnlineHandler.offlineEvent) })
    }

    return subscriptions
  }

  static async toggleListener(channel: HelixUser, listener: Listeners, enable, settings) {
    let iClient = await this.findByChannel(channel)
    if (!iClient && enable) {
      throw new Error(`User doesn't have a connected client...`)
    } else {
      if (enable && iClient?.subscriptions) {
        switch (listener) {
          case Listeners.redemption:
            iClient.subscriptions.push({
              listener: Listeners.redemption,
              subscription: await Twitch.listener.subscribeToChannelRedemptionAddEvents(channel.id, RedemptionHandler.redemptionAddEvent),
            })
            break
          case Listeners.cheer:
            iClient.subscriptions.push({ listener: Listeners.cheer, subscription: await Twitch.listener.subscribeToChannelCheerEvents(channel.id, CheerHandler.cheerEvent) })
            break
          case Listeners.hypetrain:
            iClient.subscriptions.push({
              listener: Listeners.hypetrain,
              subscription: await Twitch.listener.subscribeToChannelHypeTrainBeginEvents(channel.id, HypetrainHandler.hypeTrainBegin),
            })
            iClient.subscriptions.push({
              listener: Listeners.hypetrain,
              subscription: await Twitch.listener.subscribeToChannelHypeTrainProgressEvents(channel.id, HypetrainHandler.hypeTrainProgress),
            })
            iClient.subscriptions.push({
              listener: Listeners.hypetrain,
              subscription: await Twitch.listener.subscribeToChannelHypeTrainEndEvents(channel.id, HypetrainHandler.hypeTrainEnd),
            })
            break
        }
      } else {
        //@ts-ignore
        let toRemove: { listener: Listeners; subscription: EventSubSubscription }[] = await from(iClient.subscriptions)
          .pipe(
            filter((s) => s.listener === listener),
            toArray()
          )
          .toPromise()
        for (let sub of toRemove) {
          await sub.subscription.stop()
          //@ts-ignore
          iClient.subscriptions.splice(iClient.subscriptions.indexOf(sub), 1)
        }
      }
    }
  }
}

export class IApiClient {
  /**
   * cCarbn userId
   */
  userId: string
  user: HelixUser
  client: ApiClient
  userClient: ApiClient

  listener: EventSubListener
  subscriptions: { listener: Listeners; subscription: EventSubSubscription }[] | null

  searchChannel = async (name): Promise<HelixChannelSearchResult> => {
    //@ts-ignore
    return await from((await this.client.search.searchChannels(name)).data)
      .pipe(
        filter((channel) => channel.name === name),
        take(1)
      )
      .toPromise()
  }

  getStream = async (userId): Promise<HelixStream> => {
    //@ts-ignore
    return await this.client.streams.getStreamByUserId(userId)
  }
}

export enum Listeners {
  ban,
  cheer,
  follow,
  hypetrain,
  moderator,
  poll,
  prediction,
  raid,
  redemption,
  reward,
  subscription,
  update,
  online,
}
