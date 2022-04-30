import { OnInit, Component } from '@angular/core';
import { AuthGuard } from '../../../auth/auth.guard'
import { DataService, SERVER_URL } from 'src/app/shared/data.service'
import { EVENT_TYPES } from 'src/app/browsersource/events/events.service'
import { filter, from, map, Subject, toArray } from 'rxjs'
import { environment } from 'src/environments/environment'
import { OBSService } from 'src/app/shared/obs.service'
import { POSITION } from 'src/app/browsersource/events/events.component'
import { KeyValue } from '@angular/common'
@Component({
  selector: 'app-elements',
  templateUrl: './elements.component.html',
  styleUrls: ['./elements.component.scss']
})
export class ElementsComponent implements OnInit {

  viewport = {
    url: `${environment?.production ? 'https://cCarbn.io/' : 'http://localhost:4200/'}browsersource/${this.auth.currentUser?._id}`,
    width: 1920,
    height: 1080,
    padding: 50,
  }

  elements: _element[] = []
  channelRewards: _redemption[] = []
  uploadedSubject: Subject<any> = new Subject()

  constructor(private data: DataService, private auth: AuthGuard, public OBS: OBSService) {
    this.data.get(`user/${this.auth.currentUser?._id}/redemptions`).then(data => this.channelRewards = data)
    this.uploadedSubject.subscribe(data => {
      this.videoUploaded(data.reference.elem, data.reference.ev, data.url.url)
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
      name: 'An element',
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
    element.events.push({
      type: type
    })

    this.selectedEventType = null
    element.activeTab = element.events.length-1
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
  async deleteVideoSrc(element: _element, event, src) {
    let filePath = src.replace(SERVER_URL, '')
    if(await this.data.delete(filePath)) {
      event.src = null
      
      await this.saveElement(element)
      //TODO if element could not be saved (invalid) this can be problematic.. consider saving onls new src (original PATCH request)
    }
  }
  async videoUploaded(element: _element, event, url) {
    event.src = `${SERVER_URL}${url}`
    event.upload = false
    let fileName = event.src.replace(/^.+\//g, '')

    if(element.name === 'An element') {
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
      width: file.videoWidth||null,
      height: file.videoHeight||null,
      duration: file.duration
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
  
  _POSITION = Object.keys(POSITION)
  _video = {
    settings: {
      position: 'POSITION',
      width: 'number',
      height: 'number',
      marginTop: 'number',
      marginRight: 'number',
      marginBottom: 'number',
      marginLeft: 'number',
    }
  }
  _audio = {
    settings: {
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
      us: 'American english',
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
  delete clone.addedTab
  return clone
}

interface _redemption {
  id: string,
  title: string
}