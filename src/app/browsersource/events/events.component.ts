import { Component } from '@angular/core';
import { Subject } from 'rxjs'
import { EventsService } from './events.service'

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

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html'
})
export class EventsComponent {

  viewport = {
    width: 1920,
    height: 1080,
    padding: 50
  }

  currentEvents: any[] = []
  
  constructor(private events: EventsService) {
    events.eventsSubject.subscribe(event => {
      switch (event.what) {
        case 'start':
          this.currentEvents.push(event)
          break
        case 'ended': 
          this.currentEvents.splice(this.currentEvents.indexOf(event), 1)
          break
      }
    })
  }
}