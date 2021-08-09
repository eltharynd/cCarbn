
import { NgModule } from '@angular/core'
import { NbThemeModule, NbLayoutModule, NbIconModule, NbCardModule, NbButtonModule, NbSpinnerModule, NbSidebarModule, NbUserModule, NbActionsModule, NbContextMenuModule, NbMediaBreakpointsService, NbMenuService, NbContextMenuDirective, NbMenuModule, NbToggleModule, NbListModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatSliderModule } from '@angular/material/slider'


@NgModule({
  imports: [
    CommonModule,

    //Find an alternative to mat-slider
    FormsModule,
    MatSliderModule,

    NbThemeModule.forRoot({ name: 'dark' }),
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbLayoutModule,
    NbEvaIconsModule,
    NbIconModule,
    NbCardModule,
    NbButtonModule,
    NbToggleModule,
    NbSpinnerModule,
    NbUserModule,
    NbActionsModule,
    NbContextMenuModule,
    NbListModule,
  ],
  exports: [
    CommonModule,

    //Find an alternative to mat-slider
    FormsModule,
    MatSliderModule,

    NbThemeModule,
    NbSidebarModule,
    NbMenuModule,
    NbLayoutModule,
    NbEvaIconsModule,
    NbIconModule,
    NbCardModule,
    NbButtonModule,
    NbToggleModule,
    NbSpinnerModule,
    NbUserModule,
    NbActionsModule,
    NbContextMenuModule,
    NbListModule,
  ],
  providers: []
})
export class SharedNebularModule { }
