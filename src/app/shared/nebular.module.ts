
import { NgModule } from '@angular/core'
import { NbThemeModule, NbLayoutModule, NbIconModule, NbCardModule, NbButtonModule, NbSpinnerModule, NbSidebarModule, NbUserModule, NbActionsModule, NbContextMenuModule, NbMediaBreakpointsService, NbMenuService, NbContextMenuDirective, NbMenuModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';


@NgModule({
  imports: [
    NbThemeModule.forRoot({ name: 'dark' }),
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbLayoutModule,
    NbEvaIconsModule,
    NbIconModule,
    NbCardModule,
    NbButtonModule,
    NbSpinnerModule,
    NbUserModule,
    NbActionsModule,
    NbContextMenuModule,
  ],
  exports: [
    NbThemeModule,
    NbSidebarModule,
    NbMenuModule,
    NbLayoutModule,
    NbEvaIconsModule,
    NbIconModule,
    NbCardModule,
    NbButtonModule,
    NbSpinnerModule,
    NbUserModule,
    NbActionsModule,
    NbContextMenuModule,
  ],
  providers: []
})
export class SharedNebularModule { }
