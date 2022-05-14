import { CommonModule as AngularCommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SharedMaterialModule } from 'src/app/shared/material.module'
import { HypetrainComponent } from './hypetrain.component'
import { CarriageComponent } from './train/carriage/carriage.component'
import { LocomotiveComponent } from './train/locomotive/locomotive.component'
import { CommonModule } from '../../common/common.module'

@NgModule({
  imports: [AngularCommonModule, CommonModule, SharedMaterialModule],
  declarations: [HypetrainComponent, LocomotiveComponent, CarriageComponent],
  exports: [HypetrainComponent],
})
export class HypetrainModule {}
