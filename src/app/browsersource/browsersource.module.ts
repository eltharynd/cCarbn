import { NgModule } from "@angular/core"
import { SharedMaterialModule } from "../shared/material.module"
import { HypetrainModule } from "./hypetrain/hypetrain.module"
import { PredictionsComponent } from "./predictions/predictions.component"
import { BrowserSourceRoutingModule } from "./browsersource-routing.module"
import { BrowserSourceComponent } from "./browsersource.component";
import { AlertsComponent } from './elements/elements.component';
import { VideoComponent } from './elements/video/video.component';
import { AudioComponent } from './elements/audio/audio.component';
import { TTSComponent } from './elements/tts/tts.component';
import { ObsComponent } from './elements/obs/obs.component';
import { ChatComponent } from './elements/chat/chat.component';
import { GIFComponent } from './elements/gif/gif.component';
import { ImageComponent } from './elements/image/image.component'

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