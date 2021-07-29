import { ChatClient } from '@twurple/chat'
import { CREDENTIALS, userProvider } from '..'

export class Chat {
  static client: ChatClient

  static async init() {
    Chat.client = new ChatClient({
      authProvider: userProvider,
      channels: [CREDENTIALS.channel],
      requestMembershipEvents: true,
      logger: {
        minLevel: 'info',
      },
    })

    await Chat.client.connect()
  }
}
