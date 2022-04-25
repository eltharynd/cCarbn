import { OnInit, Component } from '@angular/core';
import { AuthGuard } from '../../../auth/auth.guard'
import { DataService, SERVER_URL } from 'src/app/shared/data.service'
import { EVENT_TYPES, POSITION } from 'src/app/websource/events/events.service'
import { concat, filter, from, map, Subject, toArray } from 'rxjs'
@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss']
})
export class ApiComponent implements OnInit {

  events: _event[] = []
  redemptions: _redemption[] = []
  uploadedSubject: Subject<any> = new Subject()

  constructor(private data: DataService, private auth: AuthGuard) {
    //TODO LOAD FROM BACKEND 


    this.data.get(`user/${this.auth.currentUser?._id}/redemptions`).then(data => this.redemptions = data)
    this.uploadedSubject.subscribe(data => {
      this.videoUploaded(data.reference.e, data.reference.ee, data.url.url)
    })
  }

  async ngOnInit() {
    this.events = await this.data.get(`events/${this.auth.currentUser?._id}`)
    for(let e of this.events) {
      e.backup = JSON.stringify(e)
    }
  }

  sendTestEvent(pointerEvent, event) {
    pointerEvent.stopPropagation()

    for(let e of event.events)
      this.data.send('test', Object.assign({}, e, {
        userId: this.auth.currentUser?._id
      }))
  }

  addNewEvent() {
    let buffer: any = {
      name: 'An event',
      conditions: [
        {
          type: 'bit',
          operator: 'equals',
          compared: 1
        }
      ],
      events: []
    }
    buffer.backup = JSON.stringify(buffer)
    this.events.push(buffer)
  }

  async save(event) {
    let valid = true
    event.error = null
    if(event.conditions.length < 1) {
      valid = false
    } else {
      for(let condition of event.conditions) {
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
    
    if(event.events.length < 1) {
      valid = false
    } else {
      //TODO check events
    }

    if(valid) {
      let clone = cleanEvent(event)
      let response = await this.data.post(`events/${this.auth.currentUser?._id}`, clone)
      if(response) {
        event._id = response
        event.changes = false
        delete event.backup
        event.backup = JSON.stringify(event)
        return event._id
      } else {
        event.error = true
        return false
      }
    } else {
      event.error = true
      return false
    }
  }
  async update(event) {
    if(!event._id) 
      if(!await this.save(event))
        return false
    

    return true

    //TODO PATCH
  }

  revert(event) {
    event.error = null
    let backup = JSON.parse(event.backup)
    for(let key of Object.keys(event)) {
      if(backup.hasOwnProperty(key)) {
        event[key] = backup[key]
      } else {
        delete event[key]
      }
    }
  }

  async deleteE(event) {
    if(event._id) 
      if(!await this.data.delete(`events/${this.auth.currentUser?._id}/${event._id}`)) return false
    
    let index = this.events.indexOf(event)
    if(index>=0) {
      this.events.splice(index, 1)
    }
    return true
  }

  addEvent(e, type) {
    e.events.push({
      type: type
    })
    setTimeout(() => {
      this._singleSelection = null
      e.changes = true
    }, 100)
  }

  deleteEvent(e, index) {
    e.events.splice(index, 1)
    setTimeout(() => {
      this._singleSelection = null
      e.changes = true
    }, 100)
  }

  addCondition(event) {
    event.conditions.push({
      type: 'bit',
      operator: 'equals',
      compared: 1
    })
    event.changes = true
  }

  deleteCondition(event, condition) {
    event.conditions.splice(event.conditions.indexOf(condition), 1)
    event.changes = true
  }


  userVideos: any[]
  userAudios: any[]
  async getUserSelectableFiles(ee) {
    let files = await this.data.get(`user/${this.auth.currentUser?._id}/uploads`)
    //@ts-ignore
    this.userVideos = await from(files).pipe(
      filter((u: any) => /^video/i.test(u.contentType)),
      map((u: any) => {
        return Object.assign(u, {
          src: `${SERVER_URL}uploads/${this.auth.currentUser?._id}/${encodeURI(u.filename)}`
        })
      }),
      toArray()
    ).toPromise()
    //@ts-ignore
    this.userAudios = await from(files).pipe(
      filter((u: any) => /^audio/i.test(u.contentType)),
      map((u: any) => {
        return Object.assign(u, {
          src: `${SERVER_URL}uploads/${this.auth.currentUser?._id}/${encodeURI(u.filename)}`
        })
      }),
      toArray()
    ).toPromise()
    ee.select = true
    ee.upload = false;
  }


  async videoSelected(e, ee) {
    let fileName = ee.src.replace(SERVER_URL,'').replace(/^.+\//g, '')
    if(!await this.data.get(`uploads/${this.auth.currentUser?._id}/link/${fileName}`)) {
      ee.src = null
      return
    }
    if(!await this.save(e)) {
      await this.data.get(`uploads/${this.auth.currentUser?._id}/unlink/${fileName}`)
      ee.src = null
    }  
  }

  async deleteVideoSrc(e, ee, src) {
    let filePath = src.replace(SERVER_URL, '')
    if(await this.data.delete(filePath)) {
      ee.src = null
      //TODO save on server
    }
  }
  
  async videoUploaded(e, ee, url) {
    ee.src = `${SERVER_URL}${url}`
    ee.upload = false
    let fileName = ee.src.replace(/^.+\//g, '')

    if(e.name === 'An event') {
      e.name = fileName
      e.changes = true
    }

    if(!await this.save(e)) {
      await this.data.get(`uploads/${this.auth.currentUser?._id}/unlink/${fileName}`)
      ee.src = null
    }  
  }
  onLoadedData(ee, data) {
    let videoFile = data.srcElement
    let videoInformation = {
      width: videoFile.videoWidth,
      height: videoFile.videoHeight,
      duration: videoFile.duration
    }
    ee.videoInformation = videoInformation
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
}

const cleanEvent = (event: _event) => {
  let clone = JSON.parse(JSON.stringify(event))
  delete clone.changes
  delete clone.select
  delete clone.upload
  delete clone.backup
  return clone
}


export interface _event {
  name: string
  conditions: _condition[]
  events: any[]
  changes?: boolean
  backup?: any
  error?: string
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