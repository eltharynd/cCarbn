import { Component } from '@angular/core';
import { Subject } from 'rxjs'
import { EventsService } from './events.service'
@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent {

  viewport = {
    width: 1920,
    height: 1080,
    padding: 50,
    background: false,
    dark: false
  }

  currentEvent
  
  constructor(private events: EventsService) {
    events.eventsSubject.subscribe(event => {
      switch (event.what) {
        case 'start':
          this.currentEvent = event
          break
        case 'ended': 
          this.currentEvent = null
          /* events.eventsSubject.next({
            what: 'stopped'
          }) */
          break
      }
    })
  }
}
