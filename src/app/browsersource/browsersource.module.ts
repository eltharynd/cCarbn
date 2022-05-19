import { NgModule } from '@angular/core'
import { SharedMaterialModule } from '../shared/material.module'
import { HypetrainModule } from './hypetrain/hypetrain.module'
import { PredictionsComponent } from './predictions/predictions.component'
import { BrowserSourceRoutingModule } from './browsersource-routing.module'
import { BrowserSourceComponent } from './browsersource.component'
import { ElementsComponent } from './elements/elements.component'
import { VideoComponent } from './elements/video/video.component'
import { AudioComponent } from './elements/audio/audio.component'
import { TTSComponent } from './elements/tts/tts.component'
import { ObsComponent } from './elements/obs/obs.component'
import { ChatComponent } from './elements/chat/chat.component'
import { GIFComponent } from './elements/gif/gif.component'
import { ImageComponent } from './elements/image/image.component'
import { ClipComponent } from './elements/clip/clip.component'
import { PredictionsModule } from './predictions/predictions.module'
import { SharedNebularModule } from '../shared/nebular.module'

@NgModule({
  imports: [BrowserSourceRoutingModule, SharedMaterialModule, SharedNebularModule, HypetrainModule, PredictionsModule],
  declarations: [BrowserSourceComponent, ElementsComponent, VideoComponent, AudioComponent, TTSComponent, ObsComponent, ChatComponent, GIFComponent, ImageComponent, ClipComponent],
})
export class BrowserSourceModule {}
