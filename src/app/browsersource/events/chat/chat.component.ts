import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'src/app/shared/data.service'
import { EventsService } from '../events.service'

@Component({
  selector: 'app-chat',
  template: '<div class="container">&nbsp;</div>'
})
export class ChatComponent implements OnInit {

  @Input() event: any


  constructor(private events: EventsService, private data: DataService) { }
  async ngOnInit() {
    if(this.data._userId)
      this.data.send('chat-relay', {
        userId: this.data._userId,
        message: this.event.text
      })
    this.onPlaybackEnded()
  }

  onPlaybackEnded() {
    this.events.eventsSubject.next({
      type: 'chat',
      what: 'ended'
    })
  }

}
