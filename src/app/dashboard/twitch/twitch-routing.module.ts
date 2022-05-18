import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AlertsComponent } from './alerts/alerts.component'
import { ChatbotComponent } from './chatbot/chatbot.component'
import { TwitchAPIComponent } from './twitchapi/twitchapi.component'
import { TwitchComponent } from './twitch.component'
import { StreamdeckComponent } from './streamdeck/streamdeck.component'
import { HypetrainComponent } from './hypetrain/hypetrain.component'

const routes: Routes = [
  {
    path: '',
    component: TwitchComponent,
    children: [
      {
        path: 'api',
        component: TwitchAPIComponent,
        data: {
          title: 'Twitch API connections',
        },
      },
      {
        path: 'alerts',
        component: AlertsComponent,
        data: {
          title: 'Alerts',
        },
      },
      {
        path: 'hypetrain',
        component: HypetrainComponent,
        data: {
          title: 'Hypetrain',
        },
      },
      {
        path: 'chatbot',
        component: ChatbotComponent,
        data: {
          title: 'Chatbot',
        },
      },
      {
        path: 'streamdeck',
        component: StreamdeckComponent,
        data: {
          title: 'Stream Deck plugin',
        },
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TwitchRoutingModule {}
