import { OnInit, Component } from '@angular/core';
import { AuthGuard } from '../../../auth/auth.guard'
import { DataService, SERVER_URL } from 'src/app/shared/data.service'
import { ELEMENT_TYPES } from 'src/app/shared/alerts.service'
import { filter, from, map, Subject, toArray } from 'rxjs'
import { environment } from 'src/environments/environment'
import { OBSService } from 'src/app/shared/obs.service'
import { POSITION, TRANSITION } from 'src/app/browsersource/elements/elements.component'
import { KeyValue } from '@angular/common'
import { ClipboardService } from 'ngx-clipboard'
@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {

  showBrowserSource = false
  viewport = {
    url: `${environment?.production ? 'https://cCarbn.io/' : 'http://localhost:4200/'}browsersource/${this.auth.currentUser?._id}`,
    width: 1920,
    height: 1080,
    padding: 50,
  }

  alerts: _alert[] = []
  channelRewards: _redemption[] = []
  uploadedSubject: Subject<any> = new Subject()

  constructor(private data: DataService, public auth: AuthGuard, public OBS: OBSService, public clipboardApi: ClipboardService) {
    this.data.get(`user/${this.auth.currentUser?._id}/redemptions`).then(data => this.channelRewards = data)
    this.uploadedSubject.subscribe(data => {
      this.mediaUploaded(data.reference.al, data.reference.ev, data.url.url)
    })
  }

  async ngOnInit() {
    this.alerts = await this.data.get(`alerts/${this.auth.currentUser?._id}`)
    for(let al of this.alerts) {
      al.backup = JSON.stringify(al)
    }

    this.data.send('requestOBSlist', {
      userId: this.auth.currentUser?._id
    })
  }

  copied
  copy() {
    this.clipboardApi.copyFromContent(this.viewport.url)
    this.copied = 'Browser Source URL copied!'
  }



  sendTestAlert(pointerEvent, alert) {
    pointerEvent.stopPropagation()
    for(let element of alert.elements) {
      this.data.send('test', Object.assign({ userId: this.auth.currentUser?._id }, element))
    }
  }



  addAlert() {
    let alert: any = {
      name: 'An alert',
      conditions: [
        {
          type: 'bit',
          operator: 'equals',
          compared: null
        }
      ],
      elements: [],
      expanded: true
    }
    alert.backup = JSON.stringify(alert)
    this.alerts.push(alert)
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 100);
  }

  revertAlert(alert: _alert) {
    alert.error = false
    let backup = JSON.parse(alert.backup)
    for(let key of Object.keys(alert)) {
      if(backup.hasOwnProperty(key)) {
        alert[key] = backup[key]
      } else {
        delete alert[key]
      }
    }
  }
  async saveAlert(alert: _alert) {
    let valid = true
    alert.error = false
    if(alert.conditions.length < 1) {
      valid = false
    } else {
      for(let condition of alert.conditions) {
        //TODO finish conditions check
        let c: _condition = condition
        try {
          if(
            (c.type === 'bit' && 
              (!this._operators.comparison.hasOwnProperty(c.operator) || parseInt(c.compared+'')<1)
            ) ||
            (c.type === 'user' && !(
              (this._operators.user.hasOwnProperty(c.operator) && !this._userTypes.hasOwnProperty(c.compared)) ||
              (this._operators.userType.hasOwnProperty(c.operator) && this._userTypes.hasOwnProperty(c.compared)))
            ) ||
            false
          )
            valid = false
        } catch (e) {
          valid = false
        }
      }
    }
    
    if(alert.elements.length < 1) {
      valid = false
    } else {
      //TODO check alerts
      delete alert.elements[0].withPrevious
    }

    if(true || valid) {
      let clone = cleanAlert(alert)
      let response = await this.data.post(`alerts/${this.auth.currentUser?._id}`, clone)
      if(response) {
        alert._id = response
        alert.changes = false
        delete alert.backup
        alert.backup = JSON.stringify(alert)
        this.data.send('alertsUpdated', {
          userId: this.auth.currentUser?._id,
          alerts: this.alerts
        })
        return alert._id
      } else {
        alert.error = true
        setTimeout(() => {
          alert.error = false
        }, 3000)
        return false
      }
    } else {
      alert.error = true
      setTimeout(() => {
        alert.error = false
      }, 3000)
      return false
    }
  }
  async deleteAlert(alert: _alert) {
    if(alert._id) 
      if(!await this.data.delete(`alerts/${this.auth.currentUser?._id}/${alert._id}`)) {
        alert.error = true
        setTimeout(() => {
          alert.error = false
        }, 3000)
        return false
      }
    
    let index = this.alerts.indexOf(alert)
    if(index>=0) {
      this.alerts.splice(index, 1)
    }
    return true
  }

  addCondition(alert: _alert) {
    alert.conditions.push({
      type: 'bit',
      operator: 'equals',
      compared: null
    })
    alert.changes = true
  }
  deleteCondition(alert: _alert, condition) {
    alert.conditions.splice(alert.conditions.indexOf(condition), 1)
    alert.changes = true
  }

  selectedElementType
  addElement(alert: _alert, type) {
    if(alert.elements.length>0) delete alert.elements[0].withPrevious
    alert.elements.push({
      type: type
    })

    this.selectedElementType = null
    alert.changes = true
  }
  deleteElement(alert: _alert, index) {
    alert.elements.splice(index, 1)
    if(alert.elements.length>0) delete alert.elements[0].withPrevious

    this.selectedElementType = null
    alert.changes = true
  }


  userVideos
  userAudios
  userGIFS
  userImages
  async getUserSelectableFiles(element) {
    let files = await this.data.get(`user/${this.auth.currentUser?._id}/uploads`)
    
    this.userVideos = await from(files).pipe(
      filter((u: any) => /^video/i.test(u.contentType)),
      map((u: any) => {
        return Object.assign(u, {
          src: `${SERVER_URL}uploads/${this.auth.currentUser?._id}/${encodeURI(u.filename)}`
        })
      }),
      toArray()
    ).toPromise()

    this.userAudios = await from(files).pipe(
      filter((u: any) => /^audio/i.test(u.contentType)),
      map((u: any) => {
        return Object.assign(u, {
          src: `${SERVER_URL}uploads/${this.auth.currentUser?._id}/${encodeURI(u.filename)}`
        })
      }),
      toArray(),
    ).toPromise()

    this.userGIFS = await from(files).pipe(
      filter((u: any) => /^image\/gif/i.test(u.contentType)),
      map((u: any) => {
        return Object.assign(u, {
          src: `${SERVER_URL}uploads/${this.auth.currentUser?._id}/${encodeURI(u.filename)}`
        })
      }),
      toArray(),
    ).toPromise()

    this.userImages = await from(files).pipe(
      filter((u: any) => /^image/i.test(u.contentType) && !/^image\/gif/i.test(u.contentType)),
      map((u: any) => {
        return Object.assign(u, {
          src: `${SERVER_URL}uploads/${this.auth.currentUser?._id}/${encodeURI(u.filename)}`
        })
      }),
      toArray(),
    ).toPromise()
    
    element.select = true
    element.upload = false;
  }


  async videoSelected(alert: _alert, element) {
    let fileName = element.src.replace(SERVER_URL,'').replace(/^.+\//g, '')
    if(!await this.data.get(`uploads/${this.auth.currentUser?._id}/link/${fileName}`)) {
      element.src = null
      return
    }
    if(!await this.saveAlert(alert)) {
      await this.data.get(`uploads/${this.auth.currentUser?._id}/unlink/${fileName}`)
      element.src = null
    }  
  }
  async deleteMediaSource(alert: _alert, element, src) {
    let filePath = src.replace(SERVER_URL, '')

    this.data.delete(filePath).then(async () => {
      element.src = null
      await this.saveAlert(alert)
    }).catch(async (e) => {
      if(e.response.status === 404) {
        element.src = null
        await this.saveAlert(alert)
      }
    })
  }
  async mediaUploaded(alert: _alert, element, url) {
    element.src = `${SERVER_URL}${url}`
    element.upload = false
    let fileName = element.src.replace(/^.+\//g, '')

    if(alert.name === 'An alert') {
      alert.name = fileName
      alert.changes = true
    }

    if(!await this.saveAlert(alert)) {
      await this.data.get(`uploads/${this.auth.currentUser?._id}/unlink/${fileName}`)
      element.src = null
    }  
  }
  onLoadedData(element, data) {
    let file = data.srcElement
    let mediaInformation = {
      width: file.videoWidth||file.naturalWidth||null,
      height: file.videoHeight||file.naturalHeight||null,
      duration: file.duration||null
    }
    element.mediaInformation = mediaInformation
  }

  originalOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
    return 0;
  }

  ElementTypes = ELEMENT_TYPES
  _conditionTypes = {
    bit: 'Bits cheered',
    redeem: 'Channel redemption',
    follow: 'Follow',
    raid: 'Raid',
    subscription: 'Subscription',
    user: 'User',
    ban: 'Ban or Timeout',
  }

  _operators = {
    comparison: {
      equals: '=',
      lesser: '<',
      lesserEqual: '<=',
      greater: '>',
      greaterEqual: '<=',
    },
    user: {
      is: 'is',
      isnt: 'isn\'t',
    },
    userType: {
      typeis: 'type is',
      typeisnt: 'type isn\'t',
    },
    redemption: {
      redeemed: 'redeemed'
    },
    subscription: {
      sub: 'User subscribed',
      subEnd: 'User sub ended',
      gift: 'User gifted a sub',
      subMessage: 'User announces sub/resub'
    },
    raid: {
      received: 'Raided by someone',
      launched: 'Raided someone else'
    },
    ban: {
      banned: 'User is banned',
      timeout: 'User timed out',
      unbanned: 'Ban/TO ended'
    },
    all : () => Object.assign({}, 
      this._operators.comparison, 
      this._operators.user, 
      this._operators.userType, 
      this._operators.redemption,
      this._operators.subscription,
      this._operators.raid,
      this._operators.ban
      )
  }

  _userTypes = {
    mod: 'Mod',
    new: 'New',
    streamer: 'Streamer',
    sub: 'Sub',
    vip: 'VIP',
    welcome: 'Just joined'
  }
  _subOptions = {
    any: 'Any',
    real: 'Only real',
    gifted: 'Only gifted'
  }
  
  _POSITION = POSITION
  _TRANSITION = TRANSITION
  _options = {
    video: {
      mandatory: {
        position: 'POSITION',
        "transition IN": 'TRANSITION',
        "transition OUT": 'TRANSITION',
      },
      default: {
        position: POSITION.CENTER,
        "transition IN": TRANSITION.NONE,
        "transition OUT": TRANSITION.NONE,
      },
      optional: {
        width: 'pixel',
        height: 'pixel',
        marginTop: 'pixel',
        marginRight: 'pixel',
        marginBottom: 'pixel',
        marginLeft: 'pixel',
      }
    },
    audio: {
      mandatory: {
      },
      default: {
      },
      optional: {
      }
    },
    gif: {
      mandatory: {
        duration: 'seconds',
        position: 'POSITION',
        "transition IN": 'TRANSITION',
        "transition OUT": 'TRANSITION',
      },
      default: {
        duration: 5,
        position: POSITION.CENTER,
        "transition IN": TRANSITION.NONE,
        "transition OUT": TRANSITION.NONE,
      },
      optional: {
        width: 'pixel',
        height: 'pixel',
        marginTop: 'pixel',
        marginRight: 'pixel',
        marginBottom: 'pixel',
        marginLeft: 'pixel',
      }
    },
    image: {
      mandatory: {
        duration: 'seconds',
        position: 'POSITION',
        "transition IN": 'TRANSITION',
        "transition OUT": 'TRANSITION',
      },
      default: {
        duration: 5,
        position: POSITION.CENTER,
        "transition IN": TRANSITION.NONE,
        "transition OUT": TRANSITION.NONE,
      },
      optional: {
        width: 'pixel',
        height: 'pixel',
        marginTop: 'pixel',
        marginRight: 'pixel',
        marginBottom: 'pixel',
        marginLeft: 'pixel',
      }
    }
  }

  _tts = {
    options: {
      redemptionMessage: 'Redemption message',
      cheerMessage: 'Cheer message',
      //subMessage: 'Sub message',
    },
    voices: {
      'en-au': 'Australian english',
      'en-uk': 'British english',
      'en-us': 'American english'
    },
    supporterVoices: {
      'google_en-US-Standard-A': 'Google - Masculine A',
      'google_en-US-Standard-B': 'Google - Masculine B',
      'google_en-US-Standard-I': 'Google - Masculine I',
      'google_en-US-Standard-J': 'Google - Masculine J',
      'google_en-US-Standard-D': 'Google - Masculine D',

      'google_en-US-Standard-C': 'Google - Feminine C',
      'google_en-US-Standard-E': 'Google - Feminine E',
      'google_en-US-Standard-F': 'Google - Feminine F',
      'google_en-US-Standard-G': 'Google - Feminine G',
      'google_en-US-Standard-H': 'Google - Feminine H',

      'aws_Amy': 'AWS - Amy',
      'aws_Aditi': 'AWS - Aditi',
      'aws_Brian': 'AWS - Brian',
      'aws_Emma': 'AWS - Emma',
      'aws_Ivy': 'AWS - Ivy',
      'aws_Joanna': 'AWS - Joanna',
      'aws_Joey': 'AWS - Joey',
      'aws_Justin': 'AWS - Justin',
      'aws_Kendra': 'AWS - Kendra',
      'aws_Kevin': 'AWS - Kevin',
      'aws_Kimberly': 'AWS - Kimberly',
      'aws_Matthew': 'AWS - Matthew',
      'aws_Nicole': 'AWS - Nicole',
      'aws_Raveena': 'AWS - Raveena',
      'aws_Russell': 'AWS - Russell',
      'aws_Salli': 'AWS - Salli',

    }, premiumVoices: {
      'google_en-US-Wavenet-A': 'Google Wavenet - Masculine A',
      'google_en-US-Wavenet-B': 'Google Wavenet - Masculine B',
      'google_en-US-Wavenet-I': 'Google Wavenet - Masculine I',
      'google_en-US-Wavenet-J': 'Google Wavenet - Masculine J',
      'google_en-US-Wavenet-D': 'Google Wavenet - Masculine D',

      'google_en-US-Wavenet-C': 'Google Wavenet - Feminine C', 
      'google_en-US-Wavenet-E': 'Google Wavenet - Feminine E', 
      'google_en-US-Wavenet-F': 'Google Wavenet - Feminine F', 
      'google_en-US-Wavenet-G': 'Google Wavenet - Feminine G', 
      'google_en-US-Wavenet-H': 'Google Wavenet - Feminine H', 

      'aws_neural_Amy': 'AWS Neural - Amy',
      'aws_neural_Aria': 'AWS Neural - Aria',
      'aws_neural_Ayanda': 'AWS Neural - Ayanda',
      'aws_neural_Brian': 'AWS Neural - Brian',
      'aws_neural_Emma': 'AWS Neural - Emma',
      'aws_neural_Geraint': 'AWS Neural - Geraint',
      'aws_neural_Ivy': 'AWS Neural - Ivy',
      'aws_neural_Joanna': 'AWS Neural - Joanna',
      'aws_neural_': 'AWS Neural - Joey',
      'aws_neural_Joey': 'AWS Neural - Justin',
      'aws_neural_Kendra': 'AWS Neural - Kendra',
      'aws_neural_Kimberly': 'AWS Neural - Kimberly',
      'aws_neural_Matthew': 'AWS Neural - Matthew',
      'aws_neural_Olivia': 'AWS Neural - Olivia',
      'aws_neural_Salli': 'AWS Neural - Salli',
    }
  }
  _obs = {
    triggers: {
      sourceVisibility: 'Source (or Group) visibility',
      filterVisibility: 'Filter visibility'
    }
  }
  _chat = {
    keywords: {
      "$user": "The display name of the user triggered the alert",
      "$user_id": "The user that triggered the alert",

      "$bits": "The amount of bits cheered",

      "$tier": "The subscription tier",
      "$is_gift": "Subscription was a gift (true/false)",
      "$gifted": "The amount of gifted subs",
      "$cumulative": "The cumulative amount of gifted subs",

      "$raider": "The display name of user that raided",
      "$raider_id": "The user that raided",
      "$raiders": "The amount of people that came with the raid",

      "$raid": "The user being raided",
      "$raid_id": "The userId being raided",

      "$ban_by": "The display name of the mod that banned/unbanned",
      "$ban_by_id": "The mod that banned/unbanned",
      "$reason": "The reason for the ban",
      "$duration": "The time left for timeout",
    }
  }

}



interface _condition {
  type: string,
  operator: string,
  compared: any
}

export interface _alert {
  name: string
  conditions: _condition[]
  elements: any[]

  _id?: string
  backup?: any
  changes?: boolean
  error?: boolean
  expanded?: any
  select?: boolean
  upload?: boolean
  activeTab?: number
}

const cleanAlert = (alert: _alert) => {
  let clone = JSON.parse(JSON.stringify(alert))
  for(let el of alert.elements) {
    delete el.select
    delete el.upload
  }
  delete clone.backup
  delete clone.changes
  delete clone.error
  delete clone.expanded
  return clone
}

interface _redemption {
  id: string,
  title: string
}