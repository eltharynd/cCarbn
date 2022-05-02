import { Component, Input } from '@angular/core';
import { EventsService } from '../events.service'

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html'
})
export class ImageComponent {

  @Input() viewport: any
  @Input() event: any

  constructor(private events: EventsService) {}

  alignItems
  justifyContent
  onLoadedData() {
    this.alignItems = null
    this.justifyContent = null
    if(this.event.position) {
      if(/TOP/.test(this.event.position)) {
        this.alignItems = 'flex-start'
      } else if(/BOTTOM/.test(this.event.position)) {
        this.alignItems = 'flex-end'
      } 

      if(/LEFT/.test(this.event.position)) {
        this.justifyContent = 'flex-start'
      } else if(/RIGHT/.test(this.event.position)) {
        this.justifyContent = 'flex-end'
      } 
    }

    setTimeout(() => {
      console.log('ending', (+this.event.duration|0)*1000)
      this.onPlaybackEnded()
    }, (+this.event.duration|5)*1000);
  }

  onPlaybackEnded() {
    this.events.eventsSubject.next({
      type: 'gif',
      what: 'ended'
    })
  }

}
