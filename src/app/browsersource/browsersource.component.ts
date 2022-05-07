import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { filter, map } from 'rxjs'
import { AuthGuard } from '../auth/auth.guard'
import { DataService } from '../shared/data.service'
import { OBSService } from '../shared/obs.service'

@Component({
  template: `
    <div class="container-v" [class.unloaded]="!loaded">
      <div class="container-h" [class.unloaded]="!loaded">
        <router-outlet></router-outlet>
        <div class="overlay-right"></div>
      </div>
      <div class="overlay-bottom">&nbsp;</div>
    </div>
  `,
  styleUrls: ['./browsersource.component.scss'],
  styles: [
    ".unloaded {overflow: hidden}"
  ]
})
export class BrowserSourceComponent implements OnInit {

  userId: string
  loaded = false
  constructor(private route: ActivatedRoute, private router: Router, private data: DataService, private auth: AuthGuard, private OBS: OBSService) {
    
    this.router.events.pipe(
      filter((event => event instanceof NavigationEnd)),
      map(() => {
        let route: ActivatedRoute = this.router.routerState.root
        while(route!.firstChild)
          route = route.firstChild
        return route.snapshot.data['route']
      })
    ).subscribe(async route => {
      if(route) {
        if(!this.auth.resumedDone.closed) await this.auth.resumedDone.toPromise()
        if(this.auth.currentUser?._id)
          this.router.navigate([`${this.auth.currentUser?._id}/${route}`], { relativeTo: this.route.parent, replaceUrl: true })
        else
          this.router.navigate(['/dashboard'])
      }
    })
  
    this.route.params.subscribe(params => {
      let userId = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i.test(params.userId) ? params.userId : null
      if(userId) {
        this.userId = params.userId
      } 
    })
  }

  async ngOnInit() {
    if(this.userId) 
      this.data.userId.next(this.userId)
    this.loaded = true
  }
}
