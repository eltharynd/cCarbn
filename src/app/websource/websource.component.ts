import { Component, OnInit } from '@angular/core';

@Component({
  template: `
    <div class="container-v">
      <div class="container-h">
        <router-outlet></router-outlet>
        <div class="overlay-right"></div>
      </div>
      <div class="overlay-bottom">&nbsp;</div>
    </div>
  `,
  styleUrls: ['./websource.component.scss']
})
export class WebSourceComponent {}
