
import { NgModule } from "@angular/core"
import { CommonModule } from "../../common/common.module"
import { SharedNebularModule } from "../../shared/nebular.module"

import { DiscordRoutingModule } from "./discord-routing.module"
import { ApiComponent } from "./api/api.component"
import { FunctionsComponent } from "./functions/functions.component";
import { DiscordComponent } from "./discord.component"

 @NgModule({
  imports: [
    DiscordRoutingModule,
    SharedNebularModule,
    CommonModule,
  ],
  declarations: [
    DiscordComponent,
    FunctionsComponent,
    ApiComponent,
  ],
 })
 export class DiscordModule { }