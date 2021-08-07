import { Component, OnInit, OnDestroy } from '@angular/core'
import { EventSubChannelHypeTrainBeginEvent, EventSubChannelHypeTrainEndEvent, EventSubChannelHypeTrainProgressEvent } from "@twurple/eventsub/lib"
import { from } from 'rxjs'
import { filter, take } from 'rxjs/operators'
import { DataService } from 'src/app/shared/data.service'
import { SeamlessLoop } from 'src/app/shared/seamlessloop'


@Component({
  selector: 'app-hypetrain',
  templateUrl: './hypetrain.component.html',
  styleUrls: ['./hypetrain.component.scss'],
})
export class HypetrainComponent implements OnInit, OnDestroy {
  currentLevel: number = 1
  currentVolume: number = .5

  percentage: number = 0
  expiryDate: number = Date.now()

  loops = {}

  now = Date.now()
  nowHandler

  constructor(private data: DataService) {}

  ngOnInit(): void {

    this.nowHandler = setInterval(() => {
      this.now = Date.now()
    }, 5)

    this.data.socketIO.emit('hypetrain')
    this.data.socketIO.on('hypetrain', (data) => {
      if(data.eventName === 'start') {
        this.currentLevel = 1
        this.expiryDate = data.expiryDate.getTime()

        this.percentage = data.progress / (data.progress + data.goal)
        this.onLevelChange()

      } else if(data.eventName === 'progress') {
        let nextLevel = data.level !== this.currentLevel ? true : false
        this.currentLevel = data.level
        this.expiryDate = data.expiryDate.getTime()

        this.percentage = data.progress / (data.progress + data.goal)
        if(nextLevel)
          this.onLevelChange()
        else
          this.onProgress()
      } else if(data.eventName === 'end') {
        this.currentLevel = 6
        this.expiryDate = 0
        this.percentage = 0
        this.onLevelChange()
      }
      
    }) 

    this.loadAudio()


  }

  ngOnDestroy() {
    this.data.socketIO.emit('hypetrain')
    this.stopAudio()

    if(this.nowHandler) {
      clearInterval(this.nowHandler)
      this.nowHandler = null
    }
  }

  loadAudio() {
  }

  stopAudio() {
  }

  onVolumeChange() {
  }

  timeout
  fader
  async onLevelChange() {
  }

  onProgress() {
  }

  reset() {
    this.currentLevel = 0
  }

  endNow() {
    if(this.timeout) clearTimeout(this.timeout)
    if(this.fader) clearInterval(this.fader)

    this.timeout = null
    this.fader = null

    this.reset()
  }
}
