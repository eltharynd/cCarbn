import { Component, OnInit } from '@angular/core';

@Component({
  template: `
    <nb-layout>
      <nb-layout-column>
        <router-outlet></router-outlet>
      </nb-layout-column>
      <nb-layout-footer>
        <app-footer></app-footer>
      </nb-layout-footer>
    </nb-layout>
  `
})
export class AuthComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
