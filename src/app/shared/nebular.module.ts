
import { NgModule } from '@angular/core'
import { NbThemeModule, NbLayoutModule, NbIconModule, NbCardModule, NbButtonModule, NbSpinnerModule, NbSidebarModule, NbUserModule, NbActionsModule, NbContextMenuModule, NbMediaBreakpointsService, NbMenuService, NbContextMenuDirective, NbMenuModule, NbToggleModule, NbListModule, NbAccordionModule, NbSelectModule, NbTabsetModule, NbInputModule, NbTooltipModule, NbCheckboxModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

@NgModule({
  imports: [
    CommonModule,
    NbThemeModule.forRoot({ name: 'dark' }),
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbLayoutModule,
    NbIconModule,
    NbEvaIconsModule,

    FormsModule,
    ReactiveFormsModule,

    NbAccordionModule,
    NbActionsModule,
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbContextMenuModule,
    NbInputModule,
    NbListModule,
    NbSelectModule,
    NbSpinnerModule,
    NbTabsetModule,
    NbToggleModule,
    NbTooltipModule,
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

    FormsModule,
    ReactiveFormsModule,
    
    NbAccordionModule,
    NbActionsModule,
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbContextMenuModule,
    NbInputModule,
    NbListModule,
    NbSelectModule,
    NbSpinnerModule,
    NbTabsetModule,
    NbToggleModule,
    NbTooltipModule,
    NbUserModule,
  ],
  providers: []
})
export class SharedNebularModule { }
