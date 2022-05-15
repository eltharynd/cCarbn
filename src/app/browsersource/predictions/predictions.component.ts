import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { DataService } from 'src/app/shared/data.service'

@Component({
  selector: 'app-predictions',
  templateUrl: './predictions.component.html',
  styleUrls: ['./predictions.component.scss'],
})
export class PredictionsComponent implements OnInit, OnDestroy {
  userId: string

  constructor(private data: DataService, private route: ActivatedRoute) {
    this.route.parent?.params.subscribe((params) => {
      this.userId = params.userId
    })
  }

  async ngOnInit() {
    if (!this.userId) return

    this.data.userId.next(this.userId)
    this.data.socketIO.on('prediction', (data) => {})
  }

  async ngOnDestroy() {
    this.data.socketIO.emit('prediction', { userId: this.userId })
  }
}
