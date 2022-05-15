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
  loops = {}

  trackUploadingSubject = new Subject<any>()
  trackChangeSubject = new Subject<any>()

  constructor(public data: DataService, public OBS: OBSService, public settings: SettingsService, public hypetrain: HypetrainService) {
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
    if (!this.settings.loaded.closed) await this.settings.loaded.toPromise()

    if (!this.settings.hypetrain) return
    await this.loadAudio()
    this.hypetrain.onLevelChange.subscribe((level) => {
      this.onLevelChange()
    })
    this.settings.updated.subscribe((settings) => {
      this.onVolumeChange()
    })
  }

  ngOnDestroy() {
    this.stopAudio()
  }

  stopAudio() {
    for (let i = 1; i <= 5; i++) {
      if (this.loops[`lvl${i}`]) {
        this.loops[`lvl${i}`].stop()
        this.loops[`lvl${i}`].gainNode.gain.value = this.settings.hypetrain.audio.volume
      }
    }

    if (this.transitioning) this.transitioning.unsubscribe()
    this.transitioning = null
    this.transitioningFrom = null
    this.lastLevel = 0
    this.changedAt = null
  }

  //TODO update
  onVolumeChange() {
    for (let i = 1; i <= 5; i++) {
      let track: Track = this.loops[`lvl${i}`]
      track.gainNode.gain.value = this.settings.hypetrain.audio.volume
    }
  }

  audioLoaded = false
  async loadAudio() {
    this.audioLoaded = false
    this.stopAudio()
    let done = 0

    for (let i = 1; i <= 5; i++) {
      let track: Track = new Track()
      track.audioContext = new AudioContext()
      track.gainNode = track.audioContext.createGain()
      track.gainNode.gain.value = this.settings.hypetrain.audio.volume
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
      this.audioLoaded = ++done >= 5
    }
  }

  lastLevel: number = 0
  changedAt: number
  transitioning
  transitioningFrom
  async onLevelChange() {
    if (this.hypetrain.currentLevel === 0) {
      return this.loadAudio()
    }
    this.changedAt = Date.now()

    let last: Track = this.lastLevel > 0 ? this.loops[`lvl${this.lastLevel}`] : null
    let current: Track = this.loops[`lvl${this.hypetrain.currentLevel}`]

    if (this.hypetrain.currentLevel < 5 && this.hypetrain.ending) {
      let i = 0
      let fader = setInterval(() => {
        let x = ++i / 100
        let f_x = Math.sin((Math.PI / 2) * x + Math.PI / 2)

        if (last) last.gainNode.gain.value = Math.max(0, Math.min(f_x * this.settings.hypetrain.audio.volume, 1))
        if (f_x * this.settings.hypetrain.audio.volume <= 0) {
          clearInterval(fader)
          fader = null
          this.stopAudio()
          this.hypetrain.testStop()
          this.lastLevel = 0
        }
      }, (this.settings.hypetrain.audio.fadingLength * 1000) / 100)
    } else if (this.hypetrain.currentLevel === 5) {
      await new Promise((resolve) => {
        let sub = last.ended.subscribe(() => {
          sub.unsubscribe()
          resolve(true)
        })
      })

      let timeLeft = this.changedAt + 5 * 60 * 1000 - Date.now()
      let timeInLevel5 = current.source.buffer?.duration * 1000
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
      if (this.settings.hypetrain.audio.fadeOnCompletion) {
        let fadingStart = this.hypetrain.expiresAt.getTime() - this.settings.hypetrain.audio.fadingLength * 1000

        setTimeout(() => {
          let i = 0
          let fader = setInterval(() => {
            let x = ++i / 100
            let f_x = Math.sin((Math.PI / 2) * x + Math.PI / 2)

            current.gainNode.gain.value = Math.max(0, Math.min(f_x * this.settings.hypetrain.audio.volume, 1))

            if (f_x * this.settings.hypetrain.audio.volume <= 0) {
              clearInterval(fader)
              fader = null
              this.hypetrain.testStop()
            }
          }, (this.settings.hypetrain.audio.fadingLength * 1000) / 100)
        }, fadingStart - Date.now())
      }

      let sub = current.ended.subscribe(() => {
        current.stop()
        sub.unsubscribe()
        this.hypetrain.testStop()
      })
    } else {
      if (last) {
        if (this.transitioning) {
          this.transitioning.unsubscribe()
          let level = this.transitioningFrom
          this.transitioning = this.loops[`lvl${level}`].ended.subscribe(() => {
            this.transitioning.unsubscribe()
            this.transitioning = null
            this.transitioningFrom = null
            this.loops[`lvl${level}`].stop()
            if (current) current.start()
          })
        } else {
          this.transitioning = last.ended.subscribe(() => {
            this.transitioning.unsubscribe()
            this.transitioning = null
            this.transitioningFrom = null
            last.stop()
            if (current) current.start()
          })
          this.transitioningFrom = this.lastLevel
        }
      } else if (current) current.start()

      this.lastLevel = this.hypetrain.currentLevel
    }
  }

  async defaultTrack(name: string) {
    let level = name.charAt(name.length - 1)

    await this.data.delete(this.settings.hypetrain.audio.tracks[level].replace(/^.*\/api\//, ''))
    this.settings.hypetrain.audio.tracks[level] = null

    this.loadAudio()
  }
}

class Track {
  audioContext: AudioContext
  gainNode: GainNode
  buffer: any
  source: AudioBufferSourceNode

  _playing: boolean
  ended: Subject<any> = new Subject()
  private interval

  start() {
    //@ts-ignore
    this.interval = setInterval(() => this.ended.next(true), this.source.buffer?.duration * 1000)
    this.source.start()
    this._playing = true
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
    this._playing = false
  }
}
