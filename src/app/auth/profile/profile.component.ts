import { Component } from '@angular/core';
import { DataService } from 'src/app/shared/data.service'
import { AuthGuard } from '../auth.guard'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  constructor(public auth: AuthGuard) { }
}
