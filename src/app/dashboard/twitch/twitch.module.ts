
import { NgModule } from "@angular/core"
import { CommonModule } from "../../common/common.module"
import { SharedMaterialModule } from "../../shared/material.module"
import { SharedNebularModule } from "../../shared/nebular.module"

import { TwitchRoutingModule } from "./twitch-routing.module"
import { TwitchComponent } from "./twitch.component"
import { ApiComponent } from "./api/api.component"
import { ChatbotComponent } from "./chatbot/chatbot.component"




 @NgModule({
  imports: [
    TwitchRoutingModule,
    SharedMaterialModule,
    SharedNebularModule,
    CommonModule,
  ],
  declarations: [
    TwitchComponent,
    ChatbotComponent,
    ApiComponent,
  ],
 })
 export class TwitchModule { }