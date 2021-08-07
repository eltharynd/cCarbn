import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { DataService } from 'src/app/shared/data.service'

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent {

  message: string = 'Saving credentials...'
  constructor(private data: DataService, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(async params => {
      if(params.code && params.state) {
        let response = await data.post('auth/token', {
          code: params.code,
          state: params.state,
          redirect: `${window.location.origin}/auth/token`
        })
        if(response) window.close()
        else this.message = 'Could not retrieve access token'
      }
    })
  }

}
