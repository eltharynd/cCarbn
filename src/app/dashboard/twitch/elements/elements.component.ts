import { OnInit, Component } from '@angular/core';
import { AuthGuard } from '../../../auth/auth.guard'
import { DataService, SERVER_URL } from 'src/app/shared/data.service'
import { EVENT_TYPES } from 'src/app/browsersource/events/events.service'
import { filter, from, map, Subject, toArray } from 'rxjs'
import { environment } from 'src/environments/environment'
import { OBSService } from 'src/app/shared/obs.service'
import { POSITION, TRANSITION } from 'src/app/browsersource/events/events.component'
import { KeyValue } from '@angular/common'
@Component({
  selector: 'app-elements',
  templateUrl: './elements.component.html',
  styleUrls: ['./elements.component.scss']
})
export class ElementsComponent implements OnInit {

  showBrowserSource = false
  viewport = {
    url: `${environment?.production ? 'https://cCarbn.io/' : 'http://localhost:4200/'}browsersource/${this.auth.currentUser?._id}`,
    width: 1920,
    height: 1080,
    padding: 50,
  }

  elements: _element[] = []
  channelRewards: _redemption[] = []
  uploadedSubject: Subject<any> = new Subject()

  constructor(private data: DataService, public auth: AuthGuard, public OBS: OBSService) {
    this.data.get(`user/${this.auth.currentUser?._id}/redemptions`).then(data => this.channelRewards = data)
    this.uploadedSubject.subscribe(data => {
      this.mediaUploaded(data.reference.elem, data.reference.ev, data.url.url)
    })
  }

  async ngOnInit() {
    this.elements = await this.data.get(`elements/${this.auth.currentUser?._id}`)
    for(let elem of this.elements) {
      elem.backup = JSON.stringify(elem)
    }

    this.data.send('requestOBSlist', {
      userId: this.auth.currentUser?._id
    })
  }

  sendTestEvent(pointerEvent, element) {
    pointerEvent.stopPropagation()
    for(let event of element.events) {
      this.data.send('test', Object.assign({ userId: this.auth.currentUser?._id }, event))
    }
  }



  addElement() {
    let element: any = {
      name: 'An alert',
      conditions: [
        {
          type: 'bit',
          operator: 'equals',
          compared: null
        }
      ],
      events: [],
      expanded: true
    }
    element.backup = JSON.stringify(element)
    this.elements.push(element)
  }

  revertElement(element: _element) {
    element.error = false
    let backup = JSON.parse(element.backup)
    for(let key of Object.keys(element)) {
      if(backup.hasOwnProperty(key)) {
        element[key] = backup[key]
      } else {
        delete element[key]
      }
    }
  }
  async saveElement(element: _element) {
    let valid = true
    element.error = false
    if(element.conditions.length < 1) {
      valid = false
    } else {
      for(let condition of element.conditions) {
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
    
    if(element.events.length < 1) {
      valid = false
    } else {
      //TODO check events
      delete element.events[0].withPrevious
    }

    if(valid) {
      let clone = cleanElement(element)
      let response = await this.data.post(`elements/${this.auth.currentUser?._id}`, clone)
      if(response) {
        element._id = response
        element.changes = false
        delete element.backup
        element.backup = JSON.stringify(element)
        this.data.send('elementsUpdated', {
          userId: this.auth.currentUser?._id,
          elements: this.elements
        })
        return element._id
      } else {
        element.error = true
        setTimeout(() => {
          element.error = false
        }, 3000)
        return false
      }
    } else {
      element.error = true
      setTimeout(() => {
        element.error = false
      }, 3000)
      return false
    }
  }
  async deleteElement(element: _element) {
    if(element._id) 
      if(!await this.data.delete(`elements/${this.auth.currentUser?._id}/${element._id}`)) {
        element.error = true
        setTimeout(() => {
          element.error = false
        }, 3000)
        return false
      }
    
    let index = this.elements.indexOf(element)
    if(index>=0) {
      this.elements.splice(index, 1)
    }
    return true
  }

  addCondition(element: _element) {
    element.conditions.push({
      type: 'bit',
      operator: 'equals',
      compared: null
    })
    element.changes = true
  }
  deleteCondition(element: _element, condition) {
    element.conditions.splice(element.conditions.indexOf(condition), 1)
    element.changes = true
  }

  selectedEventType
  addEvent(element: _element, type) {
    if(element.events.length>0) delete element.events[0].withPrevious
    element.events.push({
      type: type
    })

    this.selectedEventType = null
    element.changes = true
  }
  deleteEvent(element: _element, index) {
    element.events.splice(index, 1)
    if(element.events.length>0) delete element.events[0].withPrevious

    this.selectedEventType = null
    element.changes = true
  }


  userVideos
  userAudios
  userGIFS
  userImages
  async getUserSelectableFiles(event) {
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
    
    event.select = true
    event.upload = false;
  }


  async videoSelected(element: _element, event) {
    let fileName = event.src.replace(SERVER_URL,'').replace(/^.+\//g, '')
    if(!await this.data.get(`uploads/${this.auth.currentUser?._id}/link/${fileName}`)) {
      event.src = null
      return
    }
    if(!await this.saveElement(element)) {
      await this.data.get(`uploads/${this.auth.currentUser?._id}/unlink/${fileName}`)
      event.src = null
    }  
  }
  async deleteMediaSource(element: _element, event, src) {
    let filePath = src.replace(SERVER_URL, '')
    if(await this.data.delete(filePath)) {
      event.src = null
      
      await this.saveElement(element)
      //TODO if element could not be saved (invalid) this can be problematic.. consider saving only new src (original intended PATCH request)
    }
  }
  async mediaUploaded(element: _element, event, url) {
    event.src = `${SERVER_URL}${url}`
    event.upload = false
    let fileName = event.src.replace(/^.+\//g, '')

    if(element.name === 'An alert') {
      element.name = fileName
      element.changes = true
    }

    if(!await this.saveElement(element)) {
      await this.data.get(`uploads/${this.auth.currentUser?._id}/unlink/${fileName}`)
      event.src = null
    }  
  }
  onLoadedData(event, data) {
    let file = data.srcElement
    let mediaInformation = {
      width: file.videoWidth||file.naturalWidth||null,
      height: file.videoHeight||file.naturalHeight||null,
      duration: file.duration||null
    }
    event.mediaInformation = mediaInformation
  }

  originalOrder = (a: KeyValue<string,string>, b: KeyValue<string,string>): number => {
    return 0;
  }

  EventTypes = EVENT_TYPES
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
      au: 'Australian english',
      uk: 'British english',
      us: 'American english'
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

      'amazon_Amy': 'AWS - Amy',
      'amazon_Aditi': 'AWS - Aditi',
      'amazon_Brian': 'AWS - Brian',
      'amazon_Emma': 'AWS - Emma',
      'amazon_Ivy': 'AWS - Ivy',
      'amazon_Joanna': 'AWS - Joanna',
      'amazon_Joey': 'AWS - Joey',
      'amazon_Justin': 'AWS - Justin',
      'amazon_Kendra': 'AWS - Kendra',
      'amazon_Kevin': 'AWS - Kevin',
      'amazon_Kimberly': 'AWS - Kimberly',
      'amazon_Matthew': 'AWS - Matthew',
      'amazon_Nicole': 'AWS - Nicole',
      'amazon_Raveena': 'AWS - Raveena',
      'amazon_Russell': 'AWS - Russell',
      'amazon_Salli': 'AWS - Salli',

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

      'amazon_neural_Amy': 'AWS Neural - Amy',
      'amazon_neural_Aria': 'AWS Neural - Aria',
      'amazon_neural_Ayanda': 'AWS Neural - Ayanda',
      'amazon_neural_Brian': 'AWS Neural - Brian',
      'amazon_neural_Emma': 'AWS Neural - Emma',
      'amazon_neural_Geraint': 'AWS Neural - Geraint',
      'amazon_neural_Ivy': 'AWS Neural - Ivy',
      'amazon_neural_Joanna': 'AWS Neural - Joanna',
      'amazon_neural_': 'AWS Neural - Joey',
      'amazon_neural_Joey': 'AWS Neural - Justin',
      'amazon_neural_Kendra': 'AWS Neural - Kendra',
      'amazon_neural_Kimberly': 'AWS Neural - Kimberly',
      'amazon_neural_Matthew': 'AWS Neural - Matthew',
      'amazon_neural_Olivia': 'AWS Neural - Olivia',
      'amazon_neural_Salli': 'AWS Neural - Salli',
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
      "$user": "The display name of the user triggered the event",
      "$user_id": "The user that triggered the event",

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

export interface _element {
  name: string
  conditions: _condition[]
  events: any[]

  _id?: string
  backup?: any
  changes?: boolean
  error?: boolean
  expanded?: any
  select?: boolean
  upload?: boolean
  activeTab?: number
}

const cleanElement = (element: _element) => {
  let clone = JSON.parse(JSON.stringify(element))
  delete clone.backup
  delete clone.changes
  delete clone.error
  delete clone.expanded
  delete clone.select
  delete clone.upload
  return clone
}

interface _redemption {
  id: string,
  title: string
}