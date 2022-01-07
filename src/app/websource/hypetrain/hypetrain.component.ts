import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, OnInit, OnDestroy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { from, Subject } from 'rxjs'
import { filter, take } from 'rxjs/operators'
import { DataService, SERVER_URL } from 'src/app/shared/data.service'
import { SeamlessLoop } from 'src/app/shared/seamlessloop'
import * as merge from 'deepmerge'


@Component({
  selector: 'app-hypetrain',
  templateUrl: './hypetrain.component.html',
  styleUrls: ['./hypetrain.component.scss'],
  animations: [
    trigger('scrolling', [
      state('void', style({transform: 'translateX(100%)'})),
      state('*', style({transform: 'translateX(-100%)'})),
      transition('void=>*', animate(5000))
    ])
  ]
})
export class HypetrainComponent implements OnInit, OnDestroy {



  viewport = {
    width: 1280,
    height: 720,
    background: false,
    dark: false
  }

  infoText = {
    enabled: true,
    messages: {
      sub: '@user JUST SUBSCRIBED!! WHAT A LEGEND!',
      gift: '@user JUST GIFTED $x SUBS!! WHAT A LEGEND!',
      cheer: '@user JUST CHEERED $x BITS!! WHAT A LEGEND!'
    },
    delay: 500,
    position: 'bottom',
    fontSize: '4rem',
    fontWeight: 'bold',
    fontStroke: '#d6d6d6',
    fontStrokeWidth: '.1rem',
    color: '#4a4444',
    margin: '2rem'
  }

  train = {
    enabled: true,
    reverseDirection: false,
    maxRows: 2,
    reverseWrap: false,
    start: {
      x: 25, 
      y: 25
    },
    locomotive: {
      pictures: {
        background: null,
        foreground: null
      },
      size: {
        width: 128, 
        height: 128,
      },
      scale: .8,
      pictureBounds: {top: 0, left: 64, width: 64, height: 64, scale: .75}
    },
    carriage: {
      pictures: {
        background: null,
        foreground: null
      },
      size: {
        width: 128, 
        height: 128,
      },
      scale: .8,
      pictureBounds: {top: 32, left: 32, width: 64, height: 64, scale: .75}
    }
  }

  audio = {
    enabled: true,
    volume: 1,
    fadingLength: 30,
    fadeOnCompletion: true,
    tracks: {
      '1': null,
      '2': null,
      '3': null,
      '4': null,
      '5': null
    }
  }

  scaleLinked = true
  currentLocomotiveScale = this.train.locomotive.scale
  currentCarriageScale = this.train.carriage.scale
  
  carriages: any[] = []
  messages: string[] = []
  currentMessage

  userId: string

  currentLevel: number = 0
  currentVolume: number = 1


  percentage: number = 0
  expiryDate: number //Date.now()

  loops = {}

  now = Date.now()
  nowHandler

  channelPic

  id
  progress
  goal
  total
  lastContribution
  startDate
  topContributors
  endDate
  cooldownEndDate

  pictureChangeSubject = new Subject<any>() 
  trackUploadingSubject = new Subject<any>() 
  trackChangeSubject = new Subject<any>() 
  audioLoaded = false

  constructor(public data: DataService, private route: ActivatedRoute) {
    this.route.parent?.params.subscribe(params => {
      this.userId = params.userId
    })

    sessionStorage.viewportWidth = this.viewport.width

    this.pictureChangeSubject.subscribe(async response => {
      if(!response.url) return
      let name = response.url.replace(/^.*\//,'').replace(/\..*$/, '')
      let picture
      switch(name) {
        case 'locomotive-background':
          //@ts-ignore
          this.train.locomotive.pictures.background = `${SERVER_URL}${response.url}`
          
          picture = new Image()
          //@ts-ignore
          picture.onload = () => {
            this.train.locomotive.size.width = picture.width
            this.train.locomotive.size.height = picture.height
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
            this.train.locomotive.pictureBounds.width = picture.width
            this.train.locomotive.pictureBounds.height = picture.height
            this.train.locomotive.pictureBounds.left = Math.floor((this.train.locomotive.size.width - picture.width) / 2)
            this.train.locomotive.pictureBounds.top = Math.floor((this.train.locomotive.size.height - picture.height) / 2)
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
            this.train.carriage.size.width = picture.width
            this.train.carriage.size.height = picture.height
            this.carriages.forEach((c) => {
              c.backgroundPic = this.train.carriage.pictures.background
              c.size = this.train.carriage.size
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
            this.train.carriage.pictureBounds.width = picture.width
            this.train.carriage.pictureBounds.height = picture.height
            this.train.carriage.pictureBounds.left = Math.floor((this.train.locomotive.size.width - picture.width) / 2)
            this.train.carriage.pictureBounds.top = Math.floor((this.train.locomotive.size.height - picture.height) / 2)
            this.carriages.forEach((c) => {
              c.foregroundPic = this.train.carriage.pictures.foreground
              c.pictureBounds = this.train.carriage.pictureBounds
              c = c
            })
          }
          //@ts-ignore
          picture.src = this.train.carriage.pictures.foreground  
          break
        default: return
      }
    })

    this.trackUploadingSubject.subscribe(() => {
      this.audioLoaded = false
    })
    this.trackChangeSubject.subscribe(async response => {
      if(!response.url) return
      let name: string = response.url.replace(/^.*\//,'').replace(/\..*$/, '')
      let level = name.charAt(name.length-1)
      this.audio.tracks[level] = `${SERVER_URL}${response.url}`
      this.loops[`lvl${level}`] = null
      this.loadAudio()
    })
  }

  async ngOnInit() {
    if(!this.userId) 
      return

    let settings = await this.data.get(`user/${this.userId}/settings/api/listener/hypetrain`)
    if(!settings)
      return
    await this.prepareSettings(settings)

    this.channelPic = await this.data.get(`user/${this.userId}/picture`)
    if(!this.channelPic)
      this.channelPic = 'https://static-cdn.jtvnw.net/jtv_user_pictures/1148a899-e070-4a33-8d06-9cb84b9d2a38-profile_image-300x300.png'

    this.nowHandler = setInterval(() => {
      this.now = Date.now()
    }, 5)

    //'startDate', 'topContributors', 'total', 'level', 'endDate', 'cooldownEndDate'
    this.data.userId.next(this.userId)

    this.data.socketIO.on('hypetrain', async (data) => {
      console.info(data)

      if(data.expires_at) this.expiryDate = new Date(data.expires_at).getTime()
      if(data.goal) this.goal = data.goal
      if(data.progress) this.progress = data.progress
      if(data.total) this.total = data.total
      if(data.goal && data.progress) this.percentage = data.progress / (data.progress + data.goal)
      if(data.id) this.id = data.id
      if(data.last_contribution) {
          this.lastContribution = data.last_contribution
          let i = 1
          if(data.top_contributions) {
            for(let c of data.top_contributions)  
              setTimeout(() => {
                this.addCarriage(c)
              }, 500 * i++);
          }
          setTimeout(() => {
            this.addCarriage(data.last_contribution)
          }, 500 * i++);
      }
      if(data.started_at) this.startDate = data.started_at
      if(data.top_contributors) this.topContributors = data.top_contributors
      if(data.ended_at) this.endDate = data.ended_at //END ONLY
      if(data.cooldown_ends_at) this.cooldownEndDate = data.cooldown_ends_at //END ONLY

      if(data.type === 'Hype Train Begin') {
        this.currentLevel = 1
        this.onLevelChange()

      } else if(data.type === 'Hype Train Progress') {
        let nextLevel = data.level !== this.currentLevel && this.currentLevel!==6 ? true : false
        this.currentLevel = data.level
        if(nextLevel)
          this.onLevelChange()
        else
          this.onProgress()
      } else if(data.type === 'Hype Train End') {
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

  async loadAudio() {
    this.audioLoaded = false
    this.stopAudio()
    let done = 0

    for (let i = 1; i <= 5; i++) {
      if(!this.loops[`lvl${i}`]) {
        let track: Track = new Track()
        track.audioContext = new AudioContext()
        track.gainNode = track.audioContext.createGain()
        track.gainNode.gain.value = this.currentVolume
        track.gainNode.connect(track.audioContext.destination)
  
        let url = this.audio.tracks[i+''] ? this.audio.tracks[i+''] : `assets/sounds/hypetrain/level ${i}.mp3`
  
        let response = await fetch(url, {mode: 'cors'})
        if(response)
          track.buffer = await track.audioContext.decodeAudioData(await response.arrayBuffer())
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

  stopAudio() {
    for (let i = 1; i <= 5; i++) if(this.loops[`lvl${i}`]) this.loops[`lvl${i}`].stop()
  }

  onVolumeChange() {  
    for(let i=1; i<=5; i++) {
      let track: Track = this.loops[`lvl${i}`]
      track.gainNode.gain.value = this.currentVolume
    }
    this.audio.volume = this.currentVolume
  }


  lastLevel: number = 0
  transitioning: boolean
  prematureEnd: boolean

  fader
  changedAt
  async onLevelChange() {
    this.changedAt = Date.now()
    console.info(`${this.lastLevel} -> ${this.currentLevel}`)

    if(!this.expiryDate) this.expiryDate = Date.now() + 5*60*1000

    let last: Track = this.lastLevel>0 ? this.loops[`lvl${this.lastLevel}`] : null
    let current: Track = this.lastLevel>5 ? null : this.loops[`lvl${this.currentLevel}`]

    if(this.currentLevel === 6) {
      if(this.prematureEnd) {

        this.expiryDate = Date.now() + this.audio.fadingLength*1000
        
        let i = 0
        this.fader = setInterval(() => {
          let x = ++i / 100
          let f_x = Math.sin((Math.PI/2 * x) + (Math.PI/2))
  
          last.gainNode.gain.value = Math.max(0, Math.min(f_x * this.currentVolume, 1))
          if(f_x * this.currentVolume<=0) {
            clearInterval(this.fader)
            this.fader = null
            last.stop()
          }
        }, this.audio.fadingLength*1000 / 100)

      } else {

      }
    } else if(this.currentLevel === 5) {
      this.transitioning = true

      await new Promise(resolve => {
        let sub = last.ended.subscribe(() => {
          sub.unsubscribe()
          resolve(true)
        })
      })
    
      let timeLeft = this.changedAt + 5*60*1000 - Date.now()
      //@ts-ignore
      let timeInLevel5 = current.source.buffer?.duration * 1000
      //@ts-ignore
      let runsBeforeCompleted = Math.floor((timeLeft-timeInLevel5) / (last.source.buffer?.duration*1000))
      let runs = 0

      await new Promise(resolve => {
        let sub = last.ended.subscribe(() => {
          if(++runs >= runsBeforeCompleted) {
            sub.unsubscribe()
            resolve(true)
          }
        })  
      })

      last.stop()
      current.start()
      this.expiryDate = Date.now() + timeInLevel5
      if(this.audio.fadeOnCompletion) {
        let fadingStart = this.expiryDate - this.audio.fadingLength*1000

        setTimeout(() => {
          let i = 0
          this.fader = setInterval(() => {
            let x = ++i / 100
            let f_x = Math.sin((Math.PI/2 * x) + (Math.PI/2))
    
            current.gainNode.gain.value = Math.max(0, Math.min(f_x * this.currentVolume, 1))

            if(f_x * this.currentVolume<=0) {
              clearInterval(this.fader)
              this.fader = null
            }
          }, this.audio.fadingLength*1000 / 100)
        }, fadingStart - Date.now());
      }
     
      let sub = current.ended.subscribe(() => {
        current.stop()
        this.transitioning = false
        this.reset()
        sub.unsubscribe()
      }) 
     
    } else {
      
      if(last) {
        this.transitioning = true
        await new Promise(resolve => {
          let sub = last.ended.subscribe(() => {sub.unsubscribe(); resolve(true)})  
        })
        last.stop()
      }
      if(current) current.start()
     
      this.transitioning = false
      this.lastLevel = this.currentLevel
    }
  }

  popMessage() {
    if(this.messages.length>0) {
      if(this.currentMessage) {
        this.messages.shift()
        this.currentMessage = null
        setTimeout(() => {
          if(this.messages.length>0)  {
            this.currentMessage = this.messages[0]
          }
        }, this.infoText.delay);
      }
    }
  }

  onProgress() {

  }

  reset() {
    this.currentLevel = 0
    this.lastLevel = 0
    this.expiryDate = 0 
    this.prematureEnd = false
    this.carriages = []
    this.messages = []
    this.currentMessage = null
    this.id = null
    this.progress = null
    this.goal = null
    this.total = null
    this.lastContribution = null
    this.startDate = null
    this.topContributors = null
    //this.endDate = null
    //this.cooldownEndDate = null
  }

  endNow() {
    if(this.fader) clearInterval(this.fader)
    this.fader = null
    this.transitioning = false

    this.stopAudio()
    this.reset()
  }

  async addCarriage(lastContribution?) {
    if(lastContribution) {

      let found = await from(this.carriages).pipe(
        filter(c => c.user.name === lastContribution.user_name),
        take(1)
      ).toPromise()
      let skipMessage: boolean = false
      if(found) {
        skipMessage = found.user.total === lastContribution.total
        found.user.total = lastContribution.total
      } else {
        this.carriages.push({
          viewport: this.viewport,
          size: this.train.carriage.size,
          scale: this.train.carriage.scale,
          pictureBounds: this.train.carriage.pictureBounds,
          backgroundPic: this.train.carriage.pictures.background,
          foregroundPic: this.train.carriage.pictures.foreground,
          user: {
            name: lastContribution.user_name, 
            picture: lastContribution.picture,
            total: lastContribution.total
          }
        })
      }

      let message = this.infoText.messages[lastContribution.type === 'bits' ? 'cheer' : 'sub']
      let contribution = lastContribution.type === 'bits' ? lastContribution.total : lastContribution.total / 500 
      message = message
                  .replace(/\@user/g, lastContribution.user_name)
                  .replace(/\$x/g, lastContribution.total)
      if(contribution<1) contribution = 1
      if(contribution === 1) {
        message = message 
                  .replace(/subscriptions/g, 'subscription')
                  .replace(/Subscriptions/g, 'Subscription')
                  .replace(/subs/g, 'sub')
                  .replace(/Subs/g, 'Sub')
                  .replace(/SUBSCRIPTIONS/g, 'SUBSCRIPTION')
                  .replace(/SUBS/g, 'SUB')
      }
      if(!skipMessage) {
        this.messages.push(message)
        if(this.messages.length===1) {
          this.currentMessage = this.messages[0]
        } 
      }
    } else {
      this.carriages.push({
        viewport: this.viewport,
        size: this.train.carriage.size,
        scale: this.train.carriage.scale,
        pictureBounds: this.train.carriage.pictureBounds,
        backgroundPic: this.train.carriage.pictures.background,
        foregroundPic: this.train.carriage.pictures.foreground,
        user: {name: 'eltharynd', picture: this.channelPic, total: Math.floor((Math.random()*100+1)*100)}
      })

      let type = Math.random()>=.5 ? 'sub' : 'cheer'
      let message = this.infoText.messages[type]
      let names = ['beastMaster69', 'xXbussyMasterXx', 'cCarbn', 'eltharynd', 'julia', 'Frank', 'Bezos', 'PewDiePie', 'CinnamonToastKen']
      let name = names[Math.floor(Math.random()*names.length)]
      let contribution = Math.floor(Math.random()*10+1) * (type==='cheer' ? 100 : 5000)
      message = message.replace(/\@user/g, name).replace(/\$x/g, contribution)
      this.messages.push(message)
      if(this.messages.length===1) {
        this.currentMessage = this.messages[0]
      }
    }

    this.resizeToFit()
  }

  async scaleChange(carriage?: boolean) {
    if(this.scaleLinked) {
      if(carriage) 
        this.train.locomotive.scale = this.train.carriage.scale
      else 
        this.train.carriage.scale = this.train.locomotive.scale
    }

    this.resizeToFit()

  }

  async resizeToFit() {
    let locomotiveWidth = +this.train.locomotive.size.width * +this.train.locomotive.scale
    let carriageWidth = +this.train.carriage.size.width * +this.train.carriage.scale
    
    let viewportWidth = +this.viewport.width - +this.train.start.x

    let carriagesThatFit = Math.floor((viewportWidth - locomotiveWidth) / carriageWidth)

    if(this.carriages.length > carriagesThatFit + (carriagesThatFit + 1) * (this.train.maxRows - 1)) {

      let a = this.train.maxRows * carriageWidth
      let b = locomotiveWidth + carriageWidth * this.carriages.length
      let c = -(viewportWidth * this.train.maxRows)
      let delta = (b * b) - (4 * a * c)
      let newScale = ((-b) + Math.sqrt(delta)) / (2 * a)

      newScale = newScale * .95

      this.currentLocomotiveScale = newScale * this.train.locomotive.scale
      this.currentCarriageScale = newScale * this.train.carriage.scale
    } else {
      this.currentLocomotiveScale = this.train.locomotive.scale
      this.currentCarriageScale = this.train.carriage.scale
    }

    this.carriages.forEach((c) => {
      c.scale = this.currentCarriageScale
      c = c
    })
  }

  background() {
    localStorage.background = this.viewport.background
    localStorage.dark = this.viewport.dark
  }

  
  async prepareSettings(settings) {
    this.infoText = settings.infoText
    this.train = merge(this.train, settings.train)
    this.viewport = merge(this.viewport, settings.viewport)
    if(localStorage.background) this.viewport.background = localStorage.background === 'true'
    if(localStorage.dark) this.viewport.dark = localStorage.dark === 'true'
    this.audio = settings.audio
    this.audio.volume = Math.max(0.1, this.audio.volume)
    this.currentVolume = this.audio.volume
    this.resizeToFit()
  }
  

  
  async saveSettings() {
    let viewport = JSON.parse(JSON.stringify(this.viewport))
    delete viewport.background
    delete viewport.dark

    this.audio.volume = this.currentVolume
    let settings = {
      audio: this.audio,
      infoText: this.infoText,
      train: this.train,
      viewport: viewport
    }

    let response = await this.data.post(`user/${this.userId}/settings/api/listener/hypetrain`, settings)
    if(response)
      await this.prepareSettings(response)

  }

  async defaultPicture(name) {
    switch(name) {
      case 'locomotive-background':
        //@ts-ignore
        await this.data.delete(this.train.locomotive.pictures.background.replace(/^.*\/api\//, ''))
        //@ts-ignore
        this.train.locomotive.pictures.background = null
        this.train.locomotive.size = {width: 128, height: 128}
        
        break
      case 'locomotive-foreground':
        //@ts-ignore
        await this.data.delete(this.train.locomotive.pictures.foreground.replace(/^.*\/api\//, ''))
        //@ts-ignore
        this.train.locomotive.pictures.foreground = null
        this.train.locomotive.pictureBounds = {top: 0, left: 64, width: 64, height: 64, scale: .75}
        break
      case 'carriage-background':
        //@ts-ignore
        await this.data.delete(this.train.carriage.pictures.background.replace(/^.*\/api\//, ''))
        //@ts-ignore
        this.train.carriage.pictures.background = null
        this.train.carriage.size = {width: 128, height: 128}
        this.carriages.forEach((c) => {
          c.backgroundPic = this.train.carriage.pictures.background
          c = c
        })
        break
      case 'carriage-foreground':
        //@ts-ignore
        await this.data.delete(this.train.carriage.pictures.foreground.replace(/^.*\/api\//, ''))
        //@ts-ignore
        this.train.carriage.pictures.foreground = null
        this.train.carriage.pictureBounds = {top: 32, left: 32, width: 64, height: 64, scale: .75}
        this.carriages.forEach((c) => {
          c.foregroundPic = this.train.carriage.pictures.foreground
          c.pictureBounds = this.train.carriage.pictureBounds
          c = c
        })
        break
      default: return
    }

  }

  async defaultTrack(name: string) {

    let level = name.charAt(name.length-1)

    //@ts-ignore
    await this.data.delete(this.audio.tracks[level].replace(/^.*\/api\//, ''))
    this.audio.tracks[level] = null

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
    try { this.source.stop() } catch(e) {}
    this.source = this.audioContext.createBufferSource()
    this.source.buffer = this.buffer
    this.source.loop = true
    this.source.connect(this.gainNode)
    if(this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }
}