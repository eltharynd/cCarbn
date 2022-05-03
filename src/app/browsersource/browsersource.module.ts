import { NgModule } from "@angular/core"
import { SharedMaterialModule } from "../shared/material.module"
import { HypetrainModule } from "./hypetrain/hypetrain.module"
import { PredictionsComponent } from "./predictions/predictions.component"
import { BrowserSourceRoutingModule } from "./browsersource-routing.module"
import { BrowserSourceComponent } from "./browsersource.component";
import { AlertsComponent } from './alerts/alerts.component';
import { VideoComponent } from './alerts/video/video.component';
import { AudioComponent } from './alerts/audio/audio.component';
import { TTSComponent } from './alerts/tts/tts.component';
import { ObsComponent } from './alerts/obs/obs.component';
import { ChatComponent } from './alerts/chat/chat.component';
import { GIFComponent } from './alerts/gif/gif.component';
import { ImageComponent } from './alerts/image/image.component'

 @NgModule({
  imports: [
    BrowserSourceRoutingModule,
    SharedMaterialModule,
    HypetrainModule,
  ],
  declarations: [
    BrowserSourceComponent,
    PredictionsComponent,
    AlertsComponent,
    VideoComponent,
    AudioComponent,
    TTSComponent,
    ObsComponent,
    ChatComponent,
    GIFComponent,
    ImageComponent,
  ],
 })
 export class BrowserSourceModule {}