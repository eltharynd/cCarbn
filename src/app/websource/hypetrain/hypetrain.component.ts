import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { from } from 'rxjs'
import { filter, take } from 'rxjs/operators'
import { DataService } from 'src/app/shared/data.service'
import { SeamlessLoop } from 'src/app/shared/seamlessloop'


@Component({
  selector: 'app-hypetrain',
  templateUrl: './hypetrain.component.html',
  styleUrls: ['./hypetrain.component.scss']
})
export class HypetrainComponent implements OnInit, OnDestroy {


  viewPort = {
    width: 1280,
    height: 720
  }

  userId: string

  currentLevel: number = 0
  prematureEnd: boolean
  currentVolume: number = 1

  runsBeforeCompleted = 3
  fadingLength: number = 30

  percentage: number = 0
  expiryDate: number //Date.now()

  loops = {}

  now = Date.now()
  nowHandler


  id
  progress
  goal
  total
  lastContribution
  startDate
  topContributors
  endDate
  cooldownEndDate

  constructor(private data: DataService, private route: ActivatedRoute) {
    this.route.parent?.params.subscribe(params => {
      this.userId = params.userId
    })
  }

  async ngOnInit() {
    if(!this.userId) 
      return

    this.nowHandler = setInterval(() => {
      this.now = Date.now()
    }, 5)

    //'startDate', 'topContributors', 'total', 'level', 'endDate', 'cooldownEndDate'
    this.data.socketIO.emit('hypetrain', {userId: this.userId})
    this.data.socketIO.on('hypetrain', (data) => {

      if(data.expiryDate) this.expiryDate = data.expiryDate.getTime()
      if(data.goal) this.goal = data.goal
      if(data.progress) this.progress = data.progress
      if(data.total) this.total = data.total
      if(data.goal && data.progress) this.percentage = data.progress / (data.progress + data.goal)
      if(data.id) this.id = data.id
      if(data.lastContribution) this.lastContribution = data.lastContribution
      if(data.startDate) this.startDate = data.startDate
      if(data.topContributors) this.topContributors = data.topContributors
      if(data.endDate) this.endDate = data.endDate
      if(data.cooldownEndDate) this.cooldownEndDate = data.cooldownEndDate

      if(data.eventName === 'start') {
        this.currentLevel = 1
        this.onLevelChange()

      } else if(data.eventName === 'progress') {
        let nextLevel = data.level+1 !== this.currentLevel ? true : false
        this.currentLevel = data.level+1
        if(nextLevel)
          this.onLevelChange()
        else
          this.onProgress()
      } else if(data.eventName === 'end') {
        if(this.currentLevel<5)
          this.prematureEnd = true
        this.currentLevel = 6
        this.expiryDate = 0
        this.onLevelChange()
      }
      
    }) 

    this.loadAudio()
  }

  ngOnDestroy() {
    this.data.socketIO.emit('hypetrain', {userId: this.userId})
    this.stopAudio()

    if(this.nowHandler) {
      clearInterval(this.nowHandler)
      this.nowHandler = null
    }
  }

  loadAudio() {
    let loaded = 0
    for (let i = 1; i <= 5; i++) {
      let audio = new Audio()
      audio.src = `assets/sounds/hypetrain/default/Level ${i} Byte.mp3`
      audio.load
      audio.addEventListener('loadedmetadata', () => {
        this.loops[`lvl${i}`] = new SeamlessLoop()
        this.loops[`lvl${i}`]._volume = this.currentLevel === i ? this.currentVolume : 0
        this.loops[`lvl${i}`].addUri(`/assets/sounds/hypetrain/default/Level ${i} Byte.mp3`, audio.duration*1000, 'loop')
      })
    }
  }

  stopAudio() {
    for (let i = 1; i <= 5; i++) this.loops[`lvl${i}`].stop()
  }

  onVolumeChange() {
    for (let i = 1; i <= 5; i++) this.loops[`lvl${i}`].volume(this.loops[`lvl${i}`]._volume > 0 ? this.currentVolume : 0)
  }

  timeout
  fader
  transitioning
  lastLevel = 0
  changedAt
  async onLevelChange() {
    this.changedAt = Date.now()

    console.log(`${this.lastLevel} -> ${this.currentLevel}`)

    if(this.lastLevel<1) {
      for (let j=1; j<=4; j++)
        this.loops[`lvl${j}`].start('loop')
    } else if(this.lastLevel === 5 && this.currentLevel<6) {
      this.loops[`lvl5`].volume(0)
      this.loops[`lvl5`].stop()
    }
    if(this.currentLevel === 6) {
      this.lastLevel = this.currentLevel
      let currentLevel = await from(Object.keys(this.loops)).pipe(filter((k) => this.loops[k]._volume>0), take(1)).toPromise()
      let i = 0
      if(this.prematureEnd) {
        this.expiryDate = Date.now() + this.fadingLength*1000
      }

      this.fader = setInterval(() => {
        let x = ++i / 100
        let f_x = Math.sin((Math.PI/2 * x) + (Math.PI/2))

        if(this.prematureEnd)
          this.loops[currentLevel].volume(Math.max(0, Math.min(f_x * this.currentVolume, 1)))

        if(f_x * this.currentVolume<=0) {
          clearInterval(this.fader)
          this.fader = null
        }
      }, (this.prematureEnd ? this.fadingLength*1000 : (this.expiryDate - Date.now())) / 100)

      if(this.prematureEnd) {
        this.timeout = setTimeout(() => {
          this.timeout=null
          this.reset()
        }, this.fadingLength*1000);
      } else {
        this.loops[currentLevel].transitionCallBack = () => {
          this.reset()
        }
      }
      
    } else if(this.currentLevel>0) {
      this.expiryDate = Date.now() + 5*60*1000
      if(this.currentLevel === 5) {
        let ran = 0
        this.transitioning = true
        await new Promise(resolve => {
          this.loops[`lvl${this.lastLevel}`].transitionCallBack = () => {
            if(++ran <= this.runsBeforeCompleted)
              resolve(true)
          }
        })
        this.transitioning = false
        this.loops[`lvl${this.currentLevel}`].start('loop')
      }
      this.lastLevel = this.currentLevel
      
      this.loops[`lvl${this.currentLevel}`].volume(this.currentVolume)
      for (let i = 1; i <= 4; i++) 
        if(i!==this.currentLevel) 
          this.loops[`lvl${i}`].volume(0)
    } else {
      this.reset()
    }
  }

  onProgress() {

  }

  reset() {
    for (let i = 1; i<=5; i++) {
      this.loops[`lvl${i}`].volume(0)
      this.loops[`lvl${i}`].stop()
    }
    this.currentLevel = 0
    this.lastLevel = 0
    this.expiryDate = 0 
    this.prematureEnd = false
  }

  endNow() {
    if(this.timeout) clearTimeout(this.timeout)
    if(this.fader) clearInterval(this.fader)

    this.timeout = null
    this.fader = null

    this.reset()
  }
}
