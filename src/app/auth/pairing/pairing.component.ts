import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { DataService } from 'src/app/shared/data.service'
import { AuthGuard } from '../auth.guard'
import { SCOPES } from '../login/login.component'
import * as uuid from 'uuid'

@Component({
  selector: 'app-pairing',
  templateUrl: './pairing.component.html',
  styleUrls: ['./pairing.component.scss']
})
export class PairingComponent {

  message
  pairingKey

  constructor(public auth: AuthGuard, public data: DataService, private router: Router, private route: ActivatedRoute) { 
    route.params.subscribe(params => {
      if(params.pairingKey)
        this.pairingKey = params.pairingKey
      else
        this.router.navigate([''])
    })
  }

  pairing
  async pair() {
    let listener = this.data.socketIO.on('pairing-successfull', data => {
      console.log('SUCCESS')
      listener.close()
      window.close()
    })
    this.pairing = true
    this.data.socketIO.emit('pair', {
      userId: this.auth.currentUser?._id,
      pairingKey: this.pairingKey
    })
  }

  async loginWithTwitch() {

    if(localStorage.currentUser) {
      await this.auth.resume()
/*       if(this.auth.currentUser) {
        this.router.navigate(['/'])
        return
      } */
    }

    let state = uuid.v4()

    let listener = this.data.socketIO.on(state, (data) => {
      if(data.token) {
        this.auth.login(data, true)
        this.message = null
      } else {
        this.message = 'Could not authenticate'
      }
      listener.close()
    })

    let width = 600, height = 800

    let top = window.screen.height - height;
    top = top > 0 ? top/2 : 0;    
    let left = window.screen.width - width;
    left = left > 0 ? left/2 : 0;

    //@ts-ignore
    window.open(`https://id.twitch.tv/oauth2/authorize
    ?client_id=${DataService.clientId}
    &redirect_uri=${window.location.origin.replace('www.', '')}/auth/token
    &response_type=code
    &force_verify=true
    &state=${state}
    &scope=${SCOPES.join('+')}`
    .replace(/\s/g, '') , '_blank', `width=${width},height=${height},top=${top},left=${left},resizeable=false`)

    this.message = 'Login via the newly opened twitch window...'
  }

}
