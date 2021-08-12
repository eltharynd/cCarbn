import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { SharedMaterialModule } from "src/app/shared/material.module"
import { HypetrainComponent } from "./hypetrain.component"
import { LocomotiveComponent } from "./train/locomotive/locomotive.component"
import { TrainComponent } from "./train/train.component"

@NgModule({
    imports: [
        CommonModule,
        SharedMaterialModule,
    ],
    declarations: [
        HypetrainComponent,
        LocomotiveComponent
    ]
})
export class HypetrainModule {}