
import { NgModule } from "@angular/core"
import { CommonModule } from "../../common/common.module"
import { SharedNebularModule } from "../../shared/nebular.module"

import { TwitchRoutingModule } from "./twitch-routing.module"
import { AlertsComponent } from "./alerts/alerts.component"
import { ChatbotComponent } from "./chatbot/chatbot.component";
import { TwitchAPIComponent } from './twitchapi/twitchapi.component'
import { TwitchComponent } from "./twitch.component";
import { StreamdeckComponent } from './streamdeck/streamdeck.component'

 @NgModule({
  imports: [
    TwitchRoutingModule,
    SharedNebularModule,
    CommonModule,
  ],
  declarations: [
    TwitchComponent,
    TwitchAPIComponent,
    ChatbotComponent,
    AlertsComponent,
    StreamdeckComponent,
  ],
 })
 export class TwitchModule { }