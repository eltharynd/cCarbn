import { Component } from '@angular/core';
import { DataService } from 'src/app/shared/data.service'

import * as uuid from 'uuid'
import { AuthGuard } from '../auth.guard'

const SCOPES = [
  'bits:read',
  'channel:edit:commercial',
  'channel:manage:broadcast',
  'channel:manage:polls',
  'channel:manage:predictions',
  'channel:manage:redemptions',
  'channel:manage:schedule',
  'channel:read:hype_train',
  'channel:read:polls',
  'channel:read:predictions',
  'channel:read:redemptions',
  'channel:read:subscriptions',
  'clips:edit',
  'moderation:read',
  'user:edit',
  'user:manage:blocked_users',
  'user:read:blocked_users',
  'user:read:broadcast',
  'user:read:follows',
  'user:read:subscriptions',
  'channel:moderate',
  'chat:edit',
  'chat:read',
  'whispers:read',
  'whispers:edit'
]
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  message: string
  constructor(private data: DataService, public auth: AuthGuard) {
  }

  async loginWithTwitch() {

    let state = uuid.v4()

    let listener = this.data.socketIO.on(state, (data) => {
      if(data.token) {
        this.auth.login(data)
      } else {
        this.message = 'Could not authenticate'
      }
      listener.close()
    })

    //@ts-ignore
    window.open(`https://id.twitch.tv/oauth2/authorize
    ?client_id=${DataService.clientId}
    &redirect_uri=${window.location.origin}/auth/token
    &response_type=code
    &force_verify=true
    &state=${state}
    &scope=${SCOPES.join('+')}`
    .replace(/\s/g, '') , '_blank', 'width=600,height=800')

    this.message = 'Waiting on a response from twitch...'
  }
}
