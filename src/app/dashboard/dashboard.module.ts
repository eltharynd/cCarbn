import { NgModule } from '@angular/core'
import { CommonModule } from '../common/common.module'
import { SharedNebularModule } from '../shared/nebular.module'
import { DashboardRoutingModule } from './dashboard-routing.module'
import { DashboardComponent } from './dashboard.component'
import { DiscordModule } from './discord/discord.module'
import { HomeComponent } from './home/home.component'
import { SidebarComponent } from './sidebar/sidebar.component'
import { TwitchModule } from './twitch/twitch.module'

@NgModule({
  imports: [DashboardRoutingModule, SharedNebularModule, DiscordModule, TwitchModule, CommonModule],
  declarations: [DashboardComponent, HomeComponent, SidebarComponent],
})
export class DashboardModule {}
