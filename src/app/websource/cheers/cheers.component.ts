import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { DataService } from 'src/app/shared/data.service'

@Component({
  selector: 'app-cheers',
  templateUrl: './cheers.component.html',
  styleUrls: ['./cheers.component.scss']
})
export class CheersComponent implements OnInit, OnDestroy {

  userId: string

  constructor(private data: DataService, private route: ActivatedRoute, private router: Router) { }

  async ngOnInit() {

    this.userId = await new Promise((resolve) => {
      this.route.queryParams.subscribe(async params => {
        resolve(params.userId)
      })
    })

    if(!this.userId) 
      return

    this.data.socketIO.emit('cheer', {userId: this.userId})
    this.data.socketIO.on('cheer', (data) => {
      console.log(data)
    })
  }

  async ngOnDestroy() {
    this.data.socketIO.emit('cheer', {userId: this.userId})
  }

}
