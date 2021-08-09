import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { SharedNebularModule } from "../shared/nebular.module"
import { CheersComponent } from "./cheers/cheers.component"
import { HypetrainComponent } from "./hypetrain/hypetrain.component"
import { PredictionsComponent } from "./predictions/predictions.component"
import { WebSourceRoutingModule } from "./websource-routing.module"
import { WebSourceComponent } from "./websource.component"




 @NgModule({
  imports: [
    WebSourceRoutingModule,
    SharedNebularModule,
  ],
  declarations: [
    WebSourceComponent,
    HypetrainComponent,
    PredictionsComponent,
    CheersComponent,
  ],

 })
 export class WebSourceModule {}