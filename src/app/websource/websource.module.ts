import { NgModule } from "@angular/core"
import { SharedMaterialModule } from "../shared/material.module"
import { CheersComponent } from "./cheers/cheers.component"
import { HypetrainModule } from "./hypetrain/hypetrain.module"
import { PredictionsComponent } from "./predictions/predictions.component"
import { WebSourceRoutingModule } from "./websource-routing.module"
import { WebSourceComponent } from "./websource.component"




 @NgModule({
  imports: [
    WebSourceRoutingModule,
    HypetrainModule,
  ],
  declarations: [
    WebSourceComponent,
    PredictionsComponent,
    CheersComponent,
  ],
 })
 export class WebSourceModule {}