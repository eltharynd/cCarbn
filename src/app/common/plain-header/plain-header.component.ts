import { Component } from '@angular/core';
import { Router } from '@angular/router'
import { AuthGuard } from 'src/app/auth/auth.guard'

@Component({
  selector: 'app-plain-header',
  templateUrl: './plain-header.component.html',
  styleUrls: ['./plain-header.component.scss']
})
export class PlainHeaderComponent {

  constructor(public auth: AuthGuard) {}

}
