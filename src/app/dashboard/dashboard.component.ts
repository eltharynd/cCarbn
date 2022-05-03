import { Component, OnInit } from "@angular/core"

@Component({
  template: `
    <nb-layout restoreScrollTop>

      <nb-layout-header fixed>
        <app-header></app-header>
      </nb-layout-header>

      <nb-sidebar fixed state="collapsed" [class.loaded]="loaded">
        <app-sidebar></app-sidebar>
      </nb-sidebar>

      <nb-layout-column>
        <router-outlet></router-outlet>
      </nb-layout-column>

      <nb-layout-footer>
        <app-footer></app-footer>
      </nb-layout-footer>

    </nb-layout>
  `
})
export class DashboardComponent implements OnInit {
  loaded
  ngOnInit() {
    setTimeout(() => {
      this.loaded = true
    }, 500);   
  }
}