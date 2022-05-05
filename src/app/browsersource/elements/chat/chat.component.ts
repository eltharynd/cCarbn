import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'src/app/shared/data.service'
import { AlertsService } from '../../../shared/alerts.service'

@Component({
  selector: 'app-chat',
  template: '<div class="container">&nbsp;</div>'
})
export class ChatComponent implements OnInit {

  @Input() element: any

  constructor(private alerts: AlertsService, private data: DataService) { }
  
  async ngOnInit() {
    if(this.data._userId)
      this.data.send('chat-relay', {
        userId: this.data._userId,
        message: this.element.text
      })
    this.onPlaybackEnded()
  }

  onPlaybackEnded() {
    this.alerts.elementsSubject.next({
      type: 'chat',
      what: 'ended',
      element: this.element
    })
  }

}
