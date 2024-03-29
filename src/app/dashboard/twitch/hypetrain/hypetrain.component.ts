import { Component, OnInit, ViewChild } from '@angular/core'
import { AuthGuard } from 'src/app/auth/auth.guard'
import { DataService, SERVER_URL } from 'src/app/shared/data.service'
import { NbStepperComponent, NbWindowService } from '@nebular/theme'
import { HypetrainService } from 'src/app/shared/hypetrain.service'
import { SettingsService } from 'src/app/shared/settings.service'
import { Subject } from 'rxjs'
import { GuideComponent } from './guide/guide.component'
import { DeviceDetectorService } from 'ngx-device-detector'

@Component({
  selector: 'app-hypetrain',
  templateUrl: './hypetrain.component.html',
  styleUrls: ['./hypetrain.component.scss'],
})
export class HypetrainComponent implements OnInit {
  @ViewChild('trainStepper') trainStepper: NbStepperComponent
  steps: any = STEPS

  pictureChangeSubject = new Subject<any>()
  trackUploadedSubject = new Subject<any>()

  constructor(
    private data: DataService,
    private auth: AuthGuard,
    public hypetrain: HypetrainService,
    public settings: SettingsService,
    private windowService: NbWindowService,
    public device: DeviceDetectorService
  ) {}

  async ngOnInit() {
    this.hypetrain.onLevelChange.subscribe((level) => this.onLevelChange(level))
    this.hypetrain.onProgress.subscribe(() => this.onProgress())

    this.pictureChangeSubject.subscribe(async (response) => {
      if (!response.url) return
      let name = response.url.replace(/^.*\//, '').replace(/\..*$/, '')

      let uri = name.split('-')

      this.settings.hypetrain.train[uri[0]].pictures[uri[1]] = `${SERVER_URL}${response.url}`
      let picture = new Image()
      picture.onload = async () => {
        if (uri[1] === 'background') {
          this.settings.hypetrain.train[uri[0]].size.width = picture.width
          this.settings.hypetrain.train[uri[0]].size.height = picture.height

          if (uri[0] == 'carriage') {
            this.hypetrain.carriages.forEach((c) => {
              c.backgroundPic = this.settings.hypetrain.train.carriage.pictures.background
              c.size = this.settings.hypetrain.train.carriage.size
              c = c
            })
          }
        } else {
          this.settings.hypetrain.train[uri[0]].pictureBounds.width = picture.width
          this.settings.hypetrain.train[uri[0]].pictureBounds.height = picture.height
          this.settings.hypetrain.train[uri[0]].pictureBounds.left = Math.floor((this.settings.hypetrain.train[uri[0]].size.width - picture.width) / 2)
          this.settings.hypetrain.train[uri[0]].pictureBounds.top = Math.floor((this.settings.hypetrain.train[uri[0]].size.height - picture.height) / 2)

          if (uri[0] == 'carriage') {
            this.hypetrain.carriages.forEach((c) => {
              c.foregroundPic = this.settings.hypetrain.train.carriage.pictures.foreground
              c.pictureBounds = this.settings.hypetrain.train.carriage.pictureBounds
              c = c
            })
          }
        }

        await this.settings.onUpdated()
      }
      picture.src = this.settings.hypetrain.train[uri[0]].pictures[uri[1]]
    })

    this.trackUploadedSubject.subscribe(async (response) => {
      if (!response.url) return
      let name: string = response.url.replace(/^.*\//, '').replace(/\..*$/, '')
      let level = name.charAt(name.length - 1)
      this.settings.hypetrain.audio.tracks[level] = `${SERVER_URL}${response.url}`
      this.settings.onUpdated()
    })

    setInterval(() => {
      console.log(this.device.deviceType)
    }, 1000)
  }

  async onLevelChange(level: number) {
    this.steps = STEPS
    this.trainStepper.reset()
    if (level > 0) {
      this.steps[0].label = 'Hype Train\nin progress'
      this.trainStepper.next()
      this.steps[level].label = `Level ${level}\nin progress`
    }
    if (this.hypetrain.ending) this.steps[level].label = `Lavel ${level}\nfailed`

    for (let i = 1; i <= level - 1; i++) {
      this.steps[i].label = `Level ${i}\ncompleted`
      this.trainStepper.next()
    }
  }

  async onProgress() {
    if (this.hypetrain.currentLevel === 5 && this.hypetrain.ending) {
      this.steps[5].label = `Lavel 5\ncompleted`
      this.trainStepper.next()
    }
  }

  async defaultPicture(name: string) {
    let uri = name.split('-')

    await this.data.delete(this.settings.hypetrain.train[uri[0]].pictures[uri[1]].replace(/^.*\/api\//, ''))

    if (uri[1] === 'background') {
      this.settings.hypetrain.train[uri[0]].pictures[uri[1]] = null
      this.settings.hypetrain.train[uri[0]].size = { width: 256, height: 256 }

      if (uri[0] === 'carriage') {
        this.hypetrain.carriages.forEach((c) => {
          c.backgroundPic = this.settings.hypetrain.train.carriage.pictures.background
          c = c
        })
      }
    } else {
      this.settings.hypetrain.train[uri[0]].pictures[uri[1]] = null
      this.settings.hypetrain.train[uri[0]].pictureBounds = { top: 0, left: 128, width: 128, height: 128, scale: 75 }
      if (uri[0] === 'carriage') {
        this.settings.hypetrain.train[uri[0]].pictureBounds = { top: 64, left: 64, width: 128, height: 128, scale: 75 }
        this.hypetrain.carriages.forEach((c) => {
          c.foregroundPic = this.settings.hypetrain.train.carriage.pictures.foreground
          c.pictureBounds = this.settings.hypetrain.train.carriage.pictureBounds
          c = c
        })
      }
    }

    await this.settings.onUpdated()
  }

  openPictureGuide() {
    this.windowService.open(GuideComponent, {
      title: 'Hype Train Images',
      buttons: {
        minimize: false,
        maximize: false,
        fullScreen: false,
      },
    })
  }

  async defaultTrack(name: string) {
    let level = name.charAt(name.length - 1)
    await this.data.delete(this.settings.hypetrain.audio.tracks[level].replace(/^.*\/api\//, ''))
    this.settings.hypetrain.audio.tracks[level] = null
    this.settings.onUpdated()
  }
}

const STEPS = [
  { label: 'No\nHype Train' },
  { label: 'Level 1' },
  { label: 'Level 2' },
  { label: 'Level 3' },
  { label: 'Level 4' },
  { label: 'Level 5' },
  { label: 'Only to show lvl 5 as completed', hidden: true },
]
