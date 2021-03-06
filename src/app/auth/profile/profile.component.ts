import { Component } from '@angular/core';
import { AuthGuard } from '../auth.guard'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  constructor(public auth: AuthGuard) { }
}
