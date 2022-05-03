import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { ElementsComponent } from "./elements/elements.component"
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
        path: 'elements',
        component: ElementsComponent
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