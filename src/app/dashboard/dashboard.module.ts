
import { NgModule } from "@angular/core"
import { CommonModule } from "../common/common.module"
import { SharedMaterialModule } from "../shared/material.module"
import { SharedNebularModule } from "../shared/nebular.module"
import { DashboardRoutingModule } from "./dashboard-routing.module"
import { DashboardComponent } from "./dashboard.component";
import { DiscordModule } from "./discord/discord.module"
import { MainComponent } from './main/main.component'
import { SidebarComponent } from "./sidebar/sidebar.component"
import { TwitchModule } from "./twitch/twitch.module"




 @NgModule({
  imports: [
    DashboardRoutingModule,
    SharedMaterialModule,
    SharedNebularModule,
    DiscordModule,
    TwitchModule,
    CommonModule,
  ],
  declarations: [
    DashboardComponent,
    MainComponent,
    SidebarComponent,
  ],
 })
 export class DashboardModule { }