import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { AlertsComponent } from "./alerts/alerts.component"
import { ChatbotComponent } from "./chatbot/chatbot.component"
import { TwitchAPIComponent } from "./twitchapi/twitchapi.component"
import { TwitchComponent } from "./twitch.component"
import { StreamdeckComponent } from "./streamdeck/streamdeck.component"



const routes: Routes = [
  {
    path: '',
    component: TwitchComponent,
    children: [
      {
        path: 'api',
        component: TwitchAPIComponent
      },
      {
        path: 'alerts',
        component: AlertsComponent
      },
      {
        path: 'chatbot',
        component: ChatbotComponent,
      },
      {
        path: 'streamdeck',
        component: StreamdeckComponent,
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TwitchRoutingModule {}