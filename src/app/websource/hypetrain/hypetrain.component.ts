import { Component, OnInit, OnDestroy } from '@angular/core'
import { EventSubChannelHypeTrainBeginEvent, EventSubChannelHypeTrainEndEvent, EventSubChannelHypeTrainProgressEvent } from "@twurple/eventsub/lib"
import { StatusService } from 'src/app/shared/status.service'

export const MAX_LEVEL = 6
export const FADEOUT_DURATION = 30 * 1000

@Component({
  selector: 'app-hypetrain',
  templateUrl: './hypetrain.component.html',
  styleUrls: ['./hypetrain.component.scss'],
})
export class HypetrainComponent implements OnInit, OnDestroy {
  currentLevel: number = 0
  currentVolume: number = 1

  percentage: number = 0
  expiryDate: number = Date.now() + 1*60*1000

  private loops = {}

  now = Date.now()

  constructor(private status: StatusService) {}

  ngOnInit(): void {
    
    this.status.socketIO.emit('hypetrain')
    this.status.socketIO.on('hypetrain', (data) => {
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

    for (let i = 1; i <= MAX_LEVEL; i++) {
      this.loops[`lvl${i}`] = new Audio()
      this.loops[`lvl${i}`].src = `assets/Hype Train Level ${i} Loop.mp3`
      this.loops[`lvl${i}`].load()
      this.loops[`lvl${i}`].autoplay = true
      this.loops[`lvl${i}`].volume = 0
    }

    setInterval(() => {
      this.now = Date.now()
    }, 56)

  }

  ngOnDestroy() {
    this.status.socketIO.emit('hypetrain')
    for (let i = 1; i <= MAX_LEVEL; i++) this.loops[`lvl${i}`].stop()
  }

  onVolumeChange() {
    for (let i = 1; i <= MAX_LEVEL; i++) this.loops[`lvl${i}`].volume = this.loops[`lvl${i}`].volume > 0 ? this.currentVolume : 0
  }

  onProgress() {

  }

  onLevelChange() {
    for (let i = 1; i <= MAX_LEVEL; i++) 
      this.loops[`lvl${i}`].volume = 0
    if(this.currentLevel>0)
      this.loops[`lvl${Math.min(Math.max(1, this.currentLevel), MAX_LEVEL)}`].volume = this.currentVolume
    
    if(this.currentLevel === MAX_LEVEL)
      setTimeout(() => {
        this.currentLevel = 0
        this.onLevelChange()
      }, FADEOUT_DURATION)
  }
}
