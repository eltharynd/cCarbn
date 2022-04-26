import { Component } from '@angular/core';
import { Subject } from 'rxjs'
import { EventsService } from './events.service'
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
