import { OnInit, Component } from '@angular/core';
import { AuthGuard } from '../../../auth/auth.guard'
import { DataService, SERVER_URL } from 'src/app/shared/data.service'
import { EVENT_TYPES, POSITION } from 'src/app/browsersource/events/events.service'
import { filter, from, map, Subject, toArray } from 'rxjs'
import { environment } from 'src/environments/environment'
import { OBSService } from 'src/app/shared/obs.service'
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
      let testData: any = { userId: this.auth.currentUser?._id }
      if(event.type === 'tts') testData.text = 'This is a test TTS! I hope you enjoy it!'
      this.data.send('test', Object.assign({}, event, testData))
    }
  }



  addNewElement() {
    let element: any = {
      name: 'An event',
      conditions: [
        {
          type: 'bit',
          operator: 'equals',
          compared: 1
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
              (!this.ComparisonOperators.hasOwnProperty(c.operator) || parseInt(c.compared+'')<1)
            ) ||
            (c.type === 'user' && !(
              (this.UserOperators.hasOwnProperty(c.operator) && !this.UserTypes.hasOwnProperty(c.compared)) ||
              (this.UserTypeOperators.hasOwnProperty(c.operator) && this.UserTypes.hasOwnProperty(c.compared)))
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
        return element._id
      } else {
        element.error = true
        return false
      }
    } else {
      element.error = true
      return false
    }
  }
  async deleteElement(element: _element) {
    if(element._id) 
      if(!await this.data.delete(`elements/${this.auth.currentUser?._id}/${element._id}`)) {
        element.error = true
        return false
      }
    
    let index = this.elements.indexOf(element)
    if(index>=0) {
      this.elements.splice(index, 1)
    }
    return true
  }
  addElement(element: _element, type) {
    element.events.push({
      type: type
    })
    setTimeout(() => {
      this._singleSelection = null
      element.changes = true
    }, 100)
  }


  deleteEvent(element: _element, index) {
    element.events.splice(index, 1)
    if(element.events.length>0) delete element.events[0].withPrevious

    setTimeout(() => {
      this._singleSelection = null
      element.changes = true
    }, 100)
  }

  addCondition(element: _element) {
    element.conditions.push({
      type: 'bit',
      operator: 'equals',
      compared: 1
    })
    element.changes = true
  }

  deleteCondition(element: _element, condition) {
    element.conditions.splice(element.conditions.indexOf(condition), 1)
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

    if(element.name === 'An event') {
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


  sourcesInScene: any = []
  async sourceSelected(elem: _element, sceneName) {
    if(sceneName) {
      this.sourcesInScene = await from(this.OBS.sources).pipe(
        filter(s =>  true),
        toArray()
      ).toPromise()
    } else this.sourcesInScene = []
    elem.changes = true
  }

  EventTypes = EVENT_TYPES
  ConditionTypes = {
    bit: 'Bits cheered',
    user: 'User',
    redeem: 'Channel redemption',
  }
  ComparisonOperators = {
    equals: '=',
    lesser: '<',
    lesserEqual: '<=',
    greater: '>',
    greaterEqual: '<=',
  }
  UserTypes = {
    mod: 'Mod',
    new: 'New',
    streamer: 'Streamer',
    sub: 'Sub',
    vip: 'VIP',
    welcome: 'Just joined'
  }
  UserOperators = {
    is: 'is',
    isnt: 'isn\'t',
  }
  UserTypeOperators = {
    typeis: 'type is',
    typeisnt: 'type isn\'t',
  }
  RedemptionOperators = {
    redeemed: 'redeemed'
  }
  AllOperators = Object.assign({}, this.ComparisonOperators, this.UserOperators, this.UserTypeOperators, this.RedemptionOperators)
  _UserTypes = Object.keys(this.UserTypes)
  _singleSelection

  _POSITION = Object.keys(POSITION)
  _videoSettings = {
    position: 'POSITION',
    width: 'number',
    height: 'number',
    marginTop: 'number',
    marginRight: 'number',
    marginBottom: 'number',
    marginLeft: 'number',
  }
  _audioSettings = {
  }

  _ttsOptions = {
    redemptionMessage: 'Redemption message',
    cheerMessage: 'Cheer message',
    //subMessage: 'Sub message',
  }
  __ttsVoices = {
    au: 'Australian english',
    uk: 'British english',
    us: 'American english',
  }
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
}

interface _condition {
  type: string,
  operator: string,
  compared: any
}

interface _redemption {
  id: string,
  title: string
}