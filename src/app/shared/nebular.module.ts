
import { NgModule } from '@angular/core'
import { NbThemeModule, NbLayoutModule, NbIconModule, NbCardModule, NbButtonModule, NbSpinnerModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';

@NgModule({
  imports: [
    NbThemeModule.forRoot({ name: 'dark' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbIconModule,
    NbCardModule,
    NbButtonModule,
    NbSpinnerModule,
  ],
  exports: [
    NbThemeModule,
    NbLayoutModule,
    NbEvaIconsModule,
    NbIconModule,
    NbCardModule,
    NbButtonModule,
    NbSpinnerModule,
  ]
})
export class SharedNebularModule { }
