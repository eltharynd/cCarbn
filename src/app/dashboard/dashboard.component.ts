import { Component } from "@angular/core"

@Component({
  template: `
    <nb-layout restoreScrollTop>

      <nb-layout-header fixed>
        <app-header></app-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive>
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