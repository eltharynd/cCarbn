import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { environment } from 'src/environments/environment'
import { AuthGuard } from '../auth/auth.guard'
import { DataService } from './data.service'
import * as merge from 'deepmerge'

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  viewport: any = {
    url: `${environment?.production ? 'https://cCarbn.io/' : 'http://localhost:4200/'}browsersource/${this.auth.currentUser?._id}`,
    width: 1920,
    height: 1080,
    padding: 50,
  }
  hypetrain: any = {
    train: {
      enabled: true,
      reverseDirection: false,
      maxRows: 1,
      reverseWrap: false,
      start: {
        x: 25,
        y: 25,
      },
      locomotive: {
        pictures: {
          background: null,
          foreground: null,
        },
        size: {
          width: 256,
          height: 256,
        },
        scale: 100,
        pictureBounds: { top: 0, left: 128, width: 128, height: 128, scale: 75 },
      },
      carriage: {
        pictures: {
          background: null,
          foreground: null,
        },
        size: {
          width: 256,
          height: 256,
        },
        scale: 100,
        pictureBounds: { top: 64, left: 64, width: 128, height: 128, scale: 75 },
      },
    },
    audio: {
      enabled: true,
      volume: 0.5,
      fadingLength: 30,
      fadeOnCompletion: true,
      tracks: {
        '1': null,
        '2': null,
        '3': null,
        '4': null,
        '5': null,
      },
    },
  }

  loaded: Subject<any> = new Subject()
  updated: Subject<any> = new Subject()

  constructor(private auth: AuthGuard, private data: DataService) {
    if (!this.data._userId) {
      let subscription = this.data.userId.subscribe((data) => {
        subscription.unsubscribe()
        this.getSettings()
      })
    } else this.getSettings()
  }

  async getSettings() {
    this.hypetrain = await this.data.get(`user/${this.data._userId}/settings/api/listener/hypetrain`)
    this.data.socketIO.on('settings-updated', (data) => {
      console.log('received')
      this.onSettingsReceived(data.settings)
    })
    this.loaded.complete()
  }

  async onSettingsReceived(settings) {
    if (settings.hypetrain) {
      this.hypetrain = merge(this.hypetrain, settings.hypetrain)
    }
    this.updated.next(settings)
  }

  async onUpdated() {
    if (this.hypetrain.train.maxRows < 1) this.hypetrain.train.maxRows = 1

    let response = await this.data.post(`user/${this.data._userId}/settings/api/listener/hypetrain`, this.hypetrain)
    if (response)
      this.data.socketIO.emit('settings-updated', {
        userId: this.data._userId,
        settings: {
          viewport: this.viewport,
          hypetrain: this.hypetrain,
        },
      })
  }
}
