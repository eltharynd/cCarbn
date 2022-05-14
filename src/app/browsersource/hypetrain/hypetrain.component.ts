import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { from, Subject } from 'rxjs'
import { filter, take } from 'rxjs/operators'
import { DataService, SERVER_URL } from 'src/app/shared/data.service'
import * as merge from 'deepmerge'
import { OBSService } from 'src/app/shared/obs.service'
import { HypetrainService } from 'src/app/shared/hypetrain.service'
import { SettingsService } from 'src/app/shared/settings.service'
import { AuthGuard } from 'src/app/auth/auth.guard'

@Component({
  selector: 'app-hypetrain',
  templateUrl: './hypetrain.component.html',
  styleUrls: ['./hypetrain.component.scss'],
  animations: [
    trigger('scrolling', [state('void', style({ transform: 'translateX(100%)' })), state('*', style({ transform: 'translateX(-100%)' })), transition('void=>*', animate(5000))]),
  ],
})
export class HypetrainComponent implements OnInit, OnDestroy {
  currentVolume: number = 0.5

  loops = {}

  pictureChangeSubject = new Subject<any>()
  trackUploadingSubject = new Subject<any>()
  trackChangeSubject = new Subject<any>()
  audioLoaded = false

  constructor(public data: DataService, public OBS: OBSService, public settings: SettingsService, public hypetrain: HypetrainService) {
    /*     this.pictureChangeSubject.subscribe(async (response) => {
      if (!response.url) return
      let name = response.url.replace(/^.*\//, '').replace(/\..*$/, '')
      let picture
      switch (name) {
        case 'locomotive-background':
          //@ts-ignore
          this.train.locomotive.pictures.background = `${SERVER_URL}${response.url}`

          picture = new Image()
          //@ts-ignore
          picture.onload = () => {
            this.settings.hypetrain.train.locomotive.size.width = picture.width
            this.settings.hypetrain.train.locomotive.size.height = picture.height
          }
          //@ts-ignore
          picture.src = this.train.locomotive.pictures.background
          break
        case 'locomotive-foreground':
          //@ts-ignore
          this.train.locomotive.pictures.foreground = `${SERVER_URL}${response.url}`
          picture = new Image()
          //@ts-ignore
          picture.onload = () => {
            this.settings.hypetrain.train.locomotive.pictureBounds.width = picture.width
            this.settings.hypetrain.train.locomotive.pictureBounds.height = picture.height
            this.settings.hypetrain.train.locomotive.pictureBounds.left = Math.floor((this.settings.hypetrain.train.locomotive.size.width - picture.width) / 2)
            this.settings.hypetrain.train.locomotive.pictureBounds.top = Math.floor((this.settings.hypetrain.train.locomotive.size.height - picture.height) / 2)
          }
          //@ts-ignore
          picture.src = this.train.locomotive.pictures.foreground
          break
        case 'carriage-background':
          //@ts-ignore
          this.train.carriage.pictures.background = `${SERVER_URL}${response.url}`
          picture = new Image()
          //@ts-ignore
          picture.onload = () => {
            this.settings.hypetrain.train.carriage.size.width = picture.width
            this.settings.hypetrain.train.carriage.size.height = picture.height
            this.carriages.forEach((c) => {
              c.backgroundPic = this.settings.hypetrain.train.carriage.pictures.background
              c.size = this.settings.hypetrain.train.carriage.size
              c = c
            })
          }
          //@ts-ignore
          picture.src = this.train.carriage.pictures.background
          break
        case 'carriage-foreground':
          //@ts-ignore
          this.train.carriage.pictures.foreground = `${SERVER_URL}${response.url}`
          picture = new Image()
          //@ts-ignore
          picture.onload = () => {
            this.settings.hypetrain.train.carriage.pictureBounds.width = picture.width
            this.settings.hypetrain.train.carriage.pictureBounds.height = picture.height
            this.settings.hypetrain.train.carriage.pictureBounds.left = Math.floor((this.settings.hypetrain.train.locomotive.size.width - picture.width) / 2)
            this.settings.hypetrain.train.carriage.pictureBounds.top = Math.floor((this.settings.hypetrain.train.locomotive.size.height - picture.height) / 2)
            this.carriages.forEach((c) => {
              c.foregroundPic = this.settings.hypetrain.train.carriage.pictures.foreground
              c.pictureBounds = this.settings.hypetrain.train.carriage.pictureBounds
              c = c
            })
          }
          //@ts-ignore
          picture.src = this.train.carriage.pictures.foreground
          break
        default:
          return
      }
    }) */

    this.trackUploadingSubject.subscribe(() => {
      this.audioLoaded = false
    })
    this.trackChangeSubject.subscribe(async (response) => {
      if (!response.url) {
        this.audioLoaded = true
        return
      }
      let name: string = response.url.replace(/^.*\//, '').replace(/\..*$/, '')
      let level = name.charAt(name.length - 1)
      this.settings.hypetrain.audio.tracks[level] = `${SERVER_URL}${response.url}`
      this.loops[`lvl${level}`] = null
      this.loadAudio()
    })
  }

  async ngOnInit() {
    if (!this.data._userId) return
    console.log('checking')
    if (!this.settings.loaded.closed) await this.settings.loaded.toPromise()
    console.log('continuing')

    if (!this.settings.hypetrain) return
    await this.onSettingsReceived(this.settings.hypetrain)
    this.settings.updated.subscribe((settings) => {
      this.onSettingsReceived(settings)
    })

    this.loadAudio()
  }

  volume
  async onSettingsReceived(settings) {
    //this.settings.hypetrain.audio.volume = Math.max(0.1, this.settings.hypetrain.audio.volume)
    this.currentVolume = this.settings.hypetrain.audio.volume
    this.hypetrain.resizeToFit()
  }

  ngOnDestroy() {
    this.stopAudio()
  }

  stopAudio() {
    for (let i = 1; i <= 5; i++) if (this.loops[`lvl${i}`]) this.loops[`lvl${i}`].stop()
  }

  //TODO update
  onVolumeChange() {
    for (let i = 1; i <= 5; i++) {
      let track: Track = this.loops[`lvl${i}`]
      track.gainNode.gain.value = this.currentVolume
    }
    this.settings.hypetrain.audio.volume = this.currentVolume
  }

  async loadAudio() {
    this.audioLoaded = false
    this.stopAudio()
    let done = 0

    for (let i = 1; i <= 5; i++) {
      if (!this.loops[`lvl${i}`]) {
        let track: Track = new Track()
        track.audioContext = new AudioContext()
        track.gainNode = track.audioContext.createGain()
        track.gainNode.gain.value = this.currentVolume
        track.gainNode.connect(track.audioContext.destination)

        let url = this.settings.hypetrain.audio.tracks[i + ''] ? this.settings.hypetrain.audio.tracks[i + ''] : `assets/sounds/hypetrain/level ${i}.mp3`

        let response = await fetch(url, { mode: 'cors' })
        if (response) track.buffer = await track.audioContext.decodeAudioData(await response.arrayBuffer())
        else return console.error('Could not decode track')

        track.source = track.audioContext.createBufferSource()
        track.source.buffer = track.buffer
        track.source.loop = true
        track.source.connect(track.gainNode)

        this.loops[`lvl${i}`] = track
      }
      this.audioLoaded = ++done >= 5
    }
  }

  lastLevel: number = 0
  transitioning: boolean
  prematureEnd: boolean

  fader
  changedAt
  async onLevelChange() {
    //if (this.currentLevel === 0) return this.endNow()
    this.changedAt = Date.now()
    //console.info(`${this.lastLevel} -> ${this.currentLevel}`)

    //if (!this.expiryDate) this.expiryDate = Date.now() + 5 * 60 * 1000

    let last: Track = this.lastLevel > 0 ? this.loops[`lvl${this.lastLevel}`] : null
    let current: Track = this.lastLevel > 5 ? null : this.loops[`lvl${this.hypetrain.currentLevel}`]

    if (this.hypetrain.currentLevel === 6) {
      if (this.prematureEnd) {
        //this.expiryDate = Date.now() + this.settings.hypetrain.audio.fadingLength * 1000

        let i = 0
        this.fader = setInterval(() => {
          let x = ++i / 100
          let f_x = Math.sin((Math.PI / 2) * x + Math.PI / 2)

          last.gainNode.gain.value = Math.max(0, Math.min(f_x * this.currentVolume, 1))
          if (f_x * this.currentVolume <= 0) {
            clearInterval(this.fader)
            this.fader = null
            last.stop()
            //this.reset()
          }
        }, (this.settings.hypetrain.audio.fadingLength * 1000) / 100)
      } else {
      }
    } else if (this.hypetrain.currentLevel === 5) {
      this.transitioning = true

      await new Promise((resolve) => {
        let sub = last.ended.subscribe(() => {
          sub.unsubscribe()
          resolve(true)
        })
      })

      let timeLeft = this.changedAt + 5 * 60 * 1000 - Date.now()
      //@ts-ignore
      let timeInLevel5 = current.source.buffer?.duration * 1000
      //@ts-ignore
      let runsBeforeCompleted = Math.floor((timeLeft - timeInLevel5) / (last.source.buffer?.duration * 1000))
      let runs = 0

      await new Promise((resolve) => {
        let sub = last.ended.subscribe(() => {
          if (++runs >= runsBeforeCompleted) {
            sub.unsubscribe()
            resolve(true)
          }
        })
      })

      last.stop()
      current.start()
      //this.expiryDate = Date.now() + timeInLevel5
      if (this.settings.hypetrain.audio.fadeOnCompletion) {
        //let fadingStart = this.expiryDate - this.settings.hypetrain.audio.fadingLength * 1000
        let fadingStart = this.hypetrain.expiresAt.getTime() - this.settings.hypetrain.audio.fadingLength * 1000

        setTimeout(() => {
          let i = 0
          this.fader = setInterval(() => {
            let x = ++i / 100
            let f_x = Math.sin((Math.PI / 2) * x + Math.PI / 2)

            current.gainNode.gain.value = Math.max(0, Math.min(f_x * this.currentVolume, 1))

            if (f_x * this.currentVolume <= 0) {
              clearInterval(this.fader)
              this.fader = null
            }
          }, (this.settings.hypetrain.audio.fadingLength * 1000) / 100)
        }, fadingStart - Date.now())
      }

      let sub = current.ended.subscribe(() => {
        current.stop()
        this.transitioning = false
        //this.reset()
        sub.unsubscribe()
      })
    } else {
      if (last) {
        this.transitioning = true
        await new Promise((resolve) => {
          let sub = last.ended.subscribe(() => {
            sub.unsubscribe()
            resolve(true)
          })
        })
        last.stop()
      }
      if (current) current.start()

      this.transitioning = false
      this.lastLevel = this.hypetrain.currentLevel
    }
  }

  async defaultTrack(name: string) {
    let level = name.charAt(name.length - 1)

    //@ts-ignore
    await this.data.delete(this.audio.tracks[level].replace(/^.*\/api\//, ''))
    this.settings.hypetrain.audio.tracks[level] = null

    this.loadAudio()
  }
}

class Track {
  audioContext: AudioContext
  gainNode: GainNode
  buffer: any
  source: AudioBufferSourceNode
  ended: Subject<any>
  private interval

  start() {
    //@ts-ignore
    this.interval = setInterval(() => this.ended.next(true), this.source.buffer?.duration * 1000)
    this.ended = new Subject()
    this.source.start()
  }

  stop() {
    try {
      this.source.stop()
    } catch (e) {}
    this.source = this.audioContext.createBufferSource()
    this.source.buffer = this.buffer
    this.source.loop = true
    this.source.connect(this.gainNode)
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
}
