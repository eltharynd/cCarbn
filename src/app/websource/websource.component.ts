import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { AuthGuard } from '../auth/auth.guard'
import { DataService } from '../shared/data.service'

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
  styleUrls: ['./websource.component.scss']
})
export class WebSourceComponent implements OnInit {

  userId: string

  constructor(private route: ActivatedRoute, private router: Router, private data: DataService, private auth: AuthGuard) {
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
