import { animate, style, transition, trigger } from '@angular/animations'
import { Component } from '@angular/core'
import { DeviceDetectorService } from 'ngx-device-detector'
import { AuthGuard } from 'src/app/auth/auth.guard'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [trigger('fadeIn', [transition('void=>*', [style({ opacity: 0, transform: 'translate(-.3rem, .4rem)' }), animate('1500ms ease', style({}))])])],
})
export class HomeComponent {
  isDesktop
  constructor(public auth: AuthGuard, public device: DeviceDetectorService) {
    this.isDesktop = this.device.isDesktop()
  }
}
