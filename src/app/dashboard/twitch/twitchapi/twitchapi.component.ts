import { Component } from '@angular/core';
import { AuthGuard } from 'src/app/auth/auth.guard'
import { DataService } from 'src/app/shared/data.service'
import { ListenersService } from 'src/app/shared/listeners.service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-twitchapi',
  templateUrl: './twitchapi.component.html',
  styleUrls: ['./twitchapi.component.scss']
})
export class TwitchAPIComponent {

  url = environment?.production ? 'https://cCarbn.io/' : 'http://localhost:4200/'
  object = Object

  constructor(public listeners: ListenersService, public data: DataService, public auth: AuthGuard) {}
}
