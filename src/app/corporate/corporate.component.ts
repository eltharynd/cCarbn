import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router'
import { AuthGuard } from '../auth/auth.guard'

@Component({
  selector: 'app-corporate',
  templateUrl: './corporate.component.html',
})
export class CorporateComponent implements OnInit {

  noHeaders = false
  noBackground = false
  noPadding = false
  
  constructor(public auth: AuthGuard, public router: Router) {
    router.events.subscribe(event => {
      if(event instanceof NavigationEnd) {
        this.noBackground = /^\/(\#.*|$)/.test(event.url) || /^\/privacy/.test(event.url)
        this.noPadding = /^\/(\#.*|$)/.test(event.url)
        this.noHeaders = /^\/(\#.*|$)/.test(event.url)
      }
    })
  }

  async ngOnInit() {
    if(!this.auth.resumedDone.closed) {
      await this.auth.resumedDone.toPromise()
    }

    if(this.auth.currentUser && this.auth.instanceResumed) {
      this.auth.instanceResumed = false
    }
  }

}
