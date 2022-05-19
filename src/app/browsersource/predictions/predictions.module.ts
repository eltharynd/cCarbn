import { CommonModule as AngularCommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { TimeDifferenceModule } from 'src/app/shared/timediff.module'
import { CommonModule } from '../../common/common.module'
import { PredictionsComponent } from './predictions.component'
import { SharedNebularModule } from 'src/app/shared/nebular.module'
import { NgChartsModule } from 'ng2-charts'
import { ChannelPointsPipe, CustomPipesModule } from 'src/app/shared/pipes.module'
@NgModule({
  imports: [AngularCommonModule, CommonModule, SharedNebularModule, TimeDifferenceModule, NgChartsModule, CustomPipesModule],
  declarations: [PredictionsComponent],
  exports: [PredictionsComponent],
})
export class PredictionsModule {}
