
import { NgModule } from "@angular/core"
import { CommonModule } from "../../common/common.module"
import { SharedNebularModule } from "../../shared/nebular.module"

import { TwitchRoutingModule } from "./twitch-routing.module"
import { TwitchComponent } from "./twitch.component"
import { ApiComponent } from "./api/api.component"
import { ChatbotComponent } from "./chatbot/chatbot.component";
import { HomeComponent } from './home/home.component'




 @NgModule({
  imports: [
    TwitchRoutingModule,
    SharedNebularModule,
    CommonModule,
  ],
  declarations: [
    TwitchComponent,
    HomeComponent,
    ChatbotComponent,
    ApiComponent,
  ],
 })
 export class TwitchModule { }