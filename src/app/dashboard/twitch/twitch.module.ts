import { NgModule } from '@angular/core'
import { CommonModule } from '../../common/common.module'
import { SharedNebularModule } from '../../shared/nebular.module'

import { TwitchRoutingModule } from './twitch-routing.module'
import { AlertsComponent } from './alerts/alerts.component'
import { ChatbotComponent } from './chatbot/chatbot.component'
import { TwitchAPIComponent } from './twitchapi/twitchapi.component'
import { TwitchComponent } from './twitch.component'
import { StreamdeckComponent } from './streamdeck/streamdeck.component'
import { HypetrainComponent } from './hypetrain/hypetrain.component'
import { TimeDifferenceModule } from 'src/app/shared/timediff.module'
import { GlobalComponent } from './global/global.component'

@NgModule({
  imports: [TwitchRoutingModule, SharedNebularModule, CommonModule, TimeDifferenceModule],
  declarations: [TwitchComponent, TwitchAPIComponent, ChatbotComponent, AlertsComponent, StreamdeckComponent, HypetrainComponent, GlobalComponent],
})
export class TwitchModule {}
