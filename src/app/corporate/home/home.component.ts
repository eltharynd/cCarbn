import { animate, style, transition, trigger } from '@angular/animations'
import { Component } from '@angular/core';
import { AuthGuard } from 'src/app/auth/auth.guard'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition('void=>*', [
        style({opacity: 0, transform: 'translate(-.3rem, .4rem)'}),
        animate('1500ms ease', style({}))
      ])
    ])
  ]
})
export class HomeComponent {

  constructor(public auth: AuthGuard) { }
}
