import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { Subject } from 'rxjs'
import { AuthGuard } from 'src/app/auth/auth.guard'
import { _event } from 'src/app/dashboard/twitch/api/api.component'
import { DataService } from 'src/app/shared/data.service'

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  events: _event[] = []
  private eventsQueue: any[] = []
  eventsSubject: Subject<any> = new Subject()


  constructor(private data: DataService) { 

    this.eventsSubject.subscribe(event => {
      switch (event.what) {
        case 'ended':
          setTimeout(() => {
            this.playing = false
            this.playNext()
          }, 500);
      }
    }) 

    this.data.userId.subscribe(async user => {
      this.events = await this.data.get(`events/${user}`)
      this.data.socketIO.emit('cheer', { userId: user })
    })

    this.data.socketIO.on('events', data => {
      console.log(data)
      for(let e of this.events) {
        let relative = false
        let checks = false

        for(let c of e.conditions) {
          if(c.type === 'bit') {
            
          } else if(c.type === 'user') {
            //TODO implement
          }


        }
      }
    })
    this.data.socketIO.on('test', data => {
      this.queueUp(data)
    })
  }



  queueUp(event) {
    this.eventsQueue.push(event)
    this.playNext()
  } 
  
  private playing = false
  private playNext() {
    if(this.playing || this.eventsQueue.length<=0)
      return
    this.playing = true
    let buffer = this.eventsQueue.splice(0, 1)[0]
    this.eventsSubject.next(Object.assign(buffer, { what: 'start' }))
  } 
}

export enum POSITION {
  TOP_LEFT = 'TOP_LEFT',
  TOP = 'TOP',
  TOP_RIGHT = 'TOP_RIGHT',
  LEFT = 'LEFT',
  CENTER = 'CENTER',
  RIGHT = 'RIGHT',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM = 'BOTTOM',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT'
}

export enum EVENT_TYPES {
  video = 'Video',
  gif = 'GIF',
  message = 'Chat Message'
}