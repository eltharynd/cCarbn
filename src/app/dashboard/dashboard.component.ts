import { Component } from "@angular/core"
import { NbThemeService } from "@nebular/theme"

@Component({
  template: `
    <nb-layout restoreScrollTop centered>

      <nb-layout-header fixed>
        <app-header></app-header>
      </nb-layout-header>

      <nb-sidebar responsive>
        <app-sidebar></app-sidebar>
      </nb-sidebar>

      <nb-layout-column>
        <router-outlet></router-outlet>
      </nb-layout-column>

      <nb-layout-footer fixed>
        <app-footer></app-footer>
      </nb-layout-footer>

    </nb-layout>
  `
})
export class DashboardComponent { }