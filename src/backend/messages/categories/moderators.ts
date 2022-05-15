import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage'
import { Chat } from '../../twitch/chat'
import { Twitch } from '../../twitch/twitch'
import { filterParameters, Message } from '../message'

export class Moderators extends Message {
  twitch
  public constructor(iClient) {
    super(iClient)
    this._init()
    this._initApi()
  }

  private async _initApi() {
    this.twitch = await Twitch.findByUserId(this.iClient.userId.toString())
  }
}
