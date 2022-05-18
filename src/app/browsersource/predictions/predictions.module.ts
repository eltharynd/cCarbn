import { CommonModule as AngularCommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { TimeDifferenceModule } from 'src/app/shared/timediff.module'
import { CommonModule } from '../../common/common.module'
import { PredictionsComponent } from './predictions.component'

import { SharedNebularModule } from 'src/app/shared/nebular.module'

@NgModule({
  imports: [AngularCommonModule, CommonModule, SharedNebularModule, TimeDifferenceModule],
  declarations: [PredictionsComponent],
  exports: [PredictionsComponent],
})
export class PredictionsModule {}
