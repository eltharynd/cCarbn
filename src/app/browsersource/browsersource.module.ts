import { NgModule } from "@angular/core"
import { SharedMaterialModule } from "../shared/material.module"
import { HypetrainModule } from "./hypetrain/hypetrain.module"
import { PredictionsComponent } from "./predictions/predictions.component"
import { BrowserSourceRoutingModule } from "./browsersource-routing.module"
import { BrowserSourceComponent } from "./browsersource.component";
import { EventsComponent } from './events/events.component';
import { VideoComponent } from './events/video/video.component';
import { AudioComponent } from './events/audio/audio.component';
import { TTSComponent } from './events/tts/tts.component';
import { ObsComponent } from './events/obs/obs.component';
import { ChatComponent } from './events/chat/chat.component';
import { GIFComponent } from './events/gif/gif.component';
import { ImageComponent } from './events/image/image.component'

 @NgModule({
  imports: [
    BrowserSourceRoutingModule,
    SharedMaterialModule,
    HypetrainModule,
  ],
  declarations: [
    BrowserSourceComponent,
    PredictionsComponent,
    EventsComponent,
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