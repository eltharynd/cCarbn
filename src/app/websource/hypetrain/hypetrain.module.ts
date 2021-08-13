import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { SharedMaterialModule } from "src/app/shared/material.module"
import { SharedNebularModule } from "src/app/shared/nebular.module"
import { HypetrainComponent } from "./hypetrain.component"
import { CarriageComponent } from "./train/carriage/carriage.component"
import { LocomotiveComponent } from "./train/locomotive/locomotive.component"
import { TrainComponent } from "./train/train.component"

@NgModule({
    imports: [
        CommonModule,
        SharedMaterialModule,
    ],
    declarations: [
        HypetrainComponent,
        LocomotiveComponent,
        CarriageComponent,
    ]
})
export class HypetrainModule {}