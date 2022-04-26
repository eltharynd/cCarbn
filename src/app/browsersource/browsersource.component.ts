import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { AuthGuard } from '../auth/auth.guard'
import { DataService } from '../shared/data.service'
import { OBSService } from '../shared/obs.service'

@Component({
  template: `
    <div class="container-v">
      <div class="container-h">
        <router-outlet></router-outlet>
        <div class="overlay-right"></div>
      </div>
      <div class="overlay-bottom">&nbsp;</div>
    </div>
  `,
  styleUrls: ['./browsersource.component.scss']
})
export class BrowserSourceComponent implements OnInit {

  userId: string

  constructor(private route: ActivatedRoute, private router: Router, private data: DataService, private auth: AuthGuard, private OBS: OBSService) {
    this.route.params.subscribe(params => {
      if(params.userId) {
        if(/^[a-zA-Z]+$/g.test(params.userId)) {
          this.router.navigate([`${this.auth.currentUser?._id}/${params.userId}`], { relativeTo: this.route.parent, replaceUrl: true })
        } else {
          this.userId = params.userId
        }
      }
    })
  }

  async ngOnInit() {
    if(!this.userId) 
      return
    this.data.userId.next(this.userId)
  }
}
