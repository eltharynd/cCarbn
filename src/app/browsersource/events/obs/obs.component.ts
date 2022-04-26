import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SERVER_URL } from 'src/app/shared/data.service'
import { OBSService } from 'src/app/shared/obs.service'
import { EventsService } from '../events.service'

@Component({
  selector: 'app-obs',
  template: '<div class="container">&nbsp;</div>'
})
export class ObsComponent implements OnInit {

  @Input() event: any


  constructor(private events: EventsService, private OBS: OBSService) { }
  async ngOnInit() {
    this.OBS.toggle(this.event.toggleTo, this.event.scene, this.event.source)

    setTimeout(() => {
      this.OBS.toggle(!this.event.toggleTo, this.event.scene, this.event.source)
      this.onPlaybackEnded()
    }, this.event.for * 1000);
  }

  onPlaybackEnded() {
    this.events.eventsSubject.next({
      type: 'obs',
      what: 'ended'
    })
  }

}
