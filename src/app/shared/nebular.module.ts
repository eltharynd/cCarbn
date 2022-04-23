
import { NgModule } from '@angular/core'
import { NbThemeModule, NbLayoutModule, NbIconModule, NbCardModule, NbButtonModule, NbSpinnerModule, NbSidebarModule, NbUserModule, NbActionsModule, NbContextMenuModule, NbMediaBreakpointsService, NbMenuService, NbContextMenuDirective, NbMenuModule, NbToggleModule, NbListModule, NbAccordionModule, NbSelectModule, NbTabsetModule, NbInputModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { CommonModule } from '@angular/common'

@NgModule({
  imports: [
    CommonModule,
    NbThemeModule.forRoot({ name: 'dark' }),
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbLayoutModule,
    NbIconModule,
    NbEvaIconsModule,

    NbAccordionModule,
    NbActionsModule,
    NbButtonModule,
    NbCardModule,
    NbContextMenuModule,
    NbInputModule,
    NbListModule,
    NbSelectModule,
    NbSpinnerModule,
    NbTabsetModule,
    NbToggleModule,
    NbUserModule,
  ],
  exports: [
    CommonModule,
    NbThemeModule,
    NbSidebarModule,
    NbMenuModule,
    NbLayoutModule,
    NbIconModule,
    NbEvaIconsModule,

    NbAccordionModule,
    NbActionsModule,
    NbButtonModule,
    NbCardModule,
    NbContextMenuModule,
    NbInputModule,
    NbListModule,
    NbSelectModule,
    NbSpinnerModule,
    NbTabsetModule,
    NbToggleModule,
    NbUserModule,
  ],
  providers: []
})
export class SharedNebularModule { }
