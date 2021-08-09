import { Component, OnInit } from '@angular/core';

@Component({
  template: `
    <nb-layout center>
      <nb-layout-column>
        <router-outlet></router-outlet>
      </nb-layout-column>
    </nb-layout>
  `
})
export class AuthComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
