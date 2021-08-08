import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'
import { DataService } from 'src/app/shared/data.service'

@Component({
  selector: 'app-predictions',
  templateUrl: './predictions.component.html',
  styleUrls: ['./predictions.component.scss']
})
export class PredictionsComponent implements OnInit, OnDestroy {

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

    this.data.socketIO.emit('prediction', {userId: this.userId})
    this.data.socketIO.on('prediction', (data) => {
      console.log(data)
    })
  }

  async ngOnDestroy() {
    this.data.socketIO.emit('prediction', {userId: this.userId})
  }

}
