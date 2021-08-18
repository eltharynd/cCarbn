import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { DataService } from 'src/app/shared/data.service'

@Component({
  selector: 'app-cheers',
  templateUrl: './cheers.component.html',
  styleUrls: ['./cheers.component.scss']
})
export class CheersComponent implements OnInit, OnDestroy {

  userId: string

  constructor(private data: DataService, private route: ActivatedRoute) {
    this.route.parent?.params.subscribe(params => {
      this.userId = params.userId
    })
  }


  async ngOnInit() {
    if(!this.userId) 
      return
    this.data.userId.next(this.userId)
    this.data.socketIO.on('cheer', (data) => {
      console.log(data)
    })
  }

  async ngOnDestroy() {
    this.data.socketIO.emit('cheer', {userId: this.userId})
  }

}
