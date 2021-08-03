import { Component, OnInit, OnDestroy } from '@angular/core'
import { EventSubChannelHypeTrainBeginEvent, EventSubChannelHypeTrainEndEvent, EventSubChannelHypeTrainProgressEvent } from "@twurple/eventsub/lib"
import { from } from 'rxjs'
import { filter, take } from 'rxjs/operators'
import { SeamlessLoop } from 'src/app/shared/seamlessloop'
import { StatusService } from 'src/app/shared/status.service'


@Component({
  selector: 'app-hypetrain',
  templateUrl: './hypetrain.component.html',
  styleUrls: ['./hypetrain.component.scss'],
})
export class HypetrainComponent implements OnInit, OnDestroy {
  currentLevel: number = 0
  currentVolume: number = 1

  percentage: number = 0
  expiryDate: number = Date.now()

  loops = {}

  now = Date.now()
  nowHandler

  constructor(private status: StatusService) {}

  ngOnInit(): void {

    this.nowHandler = setInterval(() => {
      this.now = Date.now()
    }, 5)

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

    this.loadAudio()


  }

  ngOnDestroy() {
    this.status.socketIO.emit('hypetrain')
    this.stopAudio()

    if(this.nowHandler) {
      clearInterval(this.nowHandler)
      this.nowHandler = null
    }
  }

  loadAudio() {
    let loaded = 0
    for (let i = 1; i <= 6; i++) {
      let audio = new Audio()
      audio.src = `assets/Level ${i} Byte.mp3`
      audio.load
      audio.addEventListener('loadedmetadata', () => {
        this.loops[`lvl${i}`] = new SeamlessLoop()
        this.loops[`lvl${i}`]._volume = this.currentLevel === i ? this.currentVolume : 0
        this.loops[`lvl${i}`].addUri(`/assets/Level ${i} Byte.mp3`, audio.duration*1000, 'loop')
        this.loops[`lvl${i}`].callback(() => {
          loaded++
          if(loaded===6) {
            for (let j=1; j<=6; j++)
              this.loops[`lvl${j}`].start('loop')
          }
        })
      })
    }
  }

  stopAudio() {
    for (let i = 1; i <= 6; i++) this.loops[`lvl${i}`].stop()
  }

  onVolumeChange() {
    for (let i = 1; i <= 6; i++) this.loops[`lvl${i}`].volume(this.loops[`lvl${i}`]._volume > 0 ? this.currentVolume : 0)
  }

  timeout
  fader
  async onLevelChange() {
    if(this.currentLevel === 6) {
      let currentLevel = await from(Object.keys(this.loops)).pipe(filter((k) => this.loops[k]._volume>0), take(1)).toPromise()
      if(currentLevel) {
        this.loops[currentLevel].volume(this.currentVolume)
        this.loops[currentLevel].transitionCallBack = () => {
          this.loops[currentLevel].transitionCallBack = null
          this.loops[currentLevel].volume(0)
          this.loops[currentLevel].volume(this.currentVolume)
        }
        
        this.timeout = setTimeout(() => {
          this.timeout = null
          let i = 0
          this.expiryDate = Date.now() + 4.85*60*1000
          this.fader = setInterval(() => {
            let x = ++i / 100
            let f_x = Math.sin((Math.PI/2 * x) + (Math.PI/2))

            this.loops[`lvl6`].volume(Math.max(0, Math.min(f_x * this.currentVolume, 1)))
            if(f_x * this.currentVolume<=0)
              clearInterval(this.fader)
          }, this.loops[`lvl6`].duration / 100)
          this.loops[`lvl6`].transitionCallBack = () => {
            this.loops[`lvl6`].transitionCallBack = null
            this.reset()
          }
        }, 500) 
      }
    } else if(this.currentLevel>0) {
      this.loops[`lvl${this.currentLevel}`].volume(this.currentVolume)
      for (let i = 1; i <= 6; i++) 
        if(i!==this.currentLevel)  
          this.loops[`lvl${i}`].volume(0)
    } else {
      this.reset()
    }
  }

  onProgress() {

  }

  reset() {
    for (let i = 1; i<=6; i++) {
      this.loops[`lvl${i}`].volume(0)
    }
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
