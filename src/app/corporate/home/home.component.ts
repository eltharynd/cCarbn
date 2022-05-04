import { Component } from '@angular/core';
import { AuthGuard } from 'src/app/auth/auth.guard'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(public auth: AuthGuard) { }
}
