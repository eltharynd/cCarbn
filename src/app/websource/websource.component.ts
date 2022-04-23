import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
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

  constructor(private route: ActivatedRoute, private data: DataService) {
    this.route.params.subscribe(params => {
      this.userId = params.userId
    })
  }

  async ngOnInit() {
    if(!this.userId) 
      return
    this.data.userId.next(this.userId)
    this.data.socketIO.emit('bind', {
      userId: this.userId
    })
  }
}
