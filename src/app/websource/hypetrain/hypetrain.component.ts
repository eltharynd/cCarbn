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
    runsBeforeCompleted: 3,
    fadingLength: 30
  }

  scaleLinked = true
  currentLocomotiveScale = this.train.locomotive.scale
  currentCarriageScale = this.train.carriage.scale
  
  carriages: any[] = []
  messages: string[] = []
  currentMessage

  userId: string

  currentLevel: number = 0
  prematureEnd: boolean
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
          this.train.locomotive.pictures.background = `${SERVER_URL}${response.url}#`
          
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
          console.log('HERE', response.url)
          //@ts-ignore
          this.train.locomotive.pictures.foreground = `${SERVER_URL}${response.url}#`
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
          this.train.carriage.pictures.background = `${SERVER_URL}${response.url}#`
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
          this.train.carriage.pictures.foreground = `${SERVER_URL}${response.url}#`
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
      console.log(data)

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

  loadAudio() {
    let loaded = 0
    for (let i = 1; i <= 5; i++) {
      let audio = new Audio()
      //audio.src = `assets/sounds/hypetrain/default/Level ${i} Byte.mp3`
      audio.src = `assets/sounds/hypetrain/Level ${i}.mp3`
      audio.load
      audio.addEventListener('loadedmetadata', () => {
        this.loops[`lvl${i}`] = new SeamlessLoop()
        this.loops[`lvl${i}`]._volume = this.currentLevel === i ? this.currentVolume : 0
        //this.loops[`lvl${i}`].addUri(`/assets/sounds/hypetrain/default/Level ${i} Byte.mp3`, audio.duration*1000, 'loop')
        this.loops[`lvl${i}`].addUri(`/assets/sounds/hypetrain/Level ${i}.mp3`, audio.duration*1000, 'loop')
      })
    }
  }

  stopAudio() {
    for (let i = 1; i <= 5; i++) this.loops[`lvl${i}`].stop()
  }

  onVolumeChange() {
    for (let i = 1; i <= 5; i++) this.loops[`lvl${i}`].volume(this.loops[`lvl${i}`]._volume > 0 ? this.currentVolume : 0)
    this.audio.volume = this.currentVolume
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
        this.expiryDate = Date.now() + this.audio.fadingLength*1000
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
      }, (this.prematureEnd ? this.audio.fadingLength*1000 : (this.expiryDate - Date.now())) / 100)

      if(this.prematureEnd) {
        this.timeout = setTimeout(() => {
          this.timeout=null
          this.reset()
        }, this.audio.fadingLength*1000);
      } else {
        this.loops[currentLevel].transitionCallBack = () => {
          this.reset()
        }
      }
      
    } else if(this.currentLevel>0) {
      //this.expiryDate = Date.now() + 5*60*1000
      if(this.currentLevel === 5) {
        let ran = 0
        this.transitioning = true
        await new Promise(resolve => {
          this.loops[`lvl${this.lastLevel}`].transitionCallBack = () => {
            if(++ran <= this.audio.runsBeforeCompleted)
              resolve(true)
          }
        })
        this.transitioning = false
        this.loops[`lvl${this.currentLevel}`].start('loop')
      } else if(this.lastLevel>0) {
        this.transitioning = true
        await new Promise(resolve => {
          this.loops[`lvl${this.lastLevel}`].transitionCallBack = () => {
            resolve(true)
          }
        })
        this.transitioning = false
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
    for (let i = 1; i<=5; i++) {
      this.loops[`lvl${i}`].volume(0)
      this.loops[`lvl${i}`].stop()
    }
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
    if(this.timeout) clearTimeout(this.timeout)
    if(this.fader) clearInterval(this.fader)

    this.timeout = null
    this.fader = null

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
    //let rowWidth = locomotiveWidth + carriageWidth * this.carriages.length

    let carriagesThatFit = Math.floor((viewportWidth - locomotiveWidth) / carriageWidth)

    if(this.carriages.length > carriagesThatFit + (carriagesThatFit + 1) * (this.train.maxRows - 1)) {
      let marginRight = viewportWidth - locomotiveWidth - carriagesThatFit * carriageWidth
      let totalWidth = locomotiveWidth + carriageWidth * this.carriages.length + this.train.maxRows *  marginRight
      let availableWidth = viewportWidth * this.train.maxRows
      let newScale = availableWidth / totalWidth

      this.currentLocomotiveScale = newScale
      this.currentCarriageScale = newScale
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
}
