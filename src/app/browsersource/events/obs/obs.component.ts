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

    switch (this.event.trigger) {
      case 'sourceVisibility':
        this.OBS.toggleSource(this.event.toggleTo, this.event.scene.sceneName ? this.event.scene.sceneName : this.event.scene, this.event.source.sourceName? this.event.source.sourceName : this.event.source)

        setTimeout(() => {
          console.log('tick', this.event.duration, +this.event.duration|0)
          if(this.event.revert)
            this.OBS.toggleSource(!this.event.toggleTo, this.event.scene.sceneName ? this.event.scene.sceneName : this.event.scene, this.event.source.sourceName? this.event.source.sourceName : this.event.source)
          this.onPlaybackEnded()
        }, ((+this.event.duration)|500) * 1000);
        break
      case 'filterVisibility':
        this.OBS.toggleFilter(this.event.toggleTo, this.event.input.inputName? this.event.input.inputName : this.event.input, this.event.filter.filterName? this.event.filter.filterName : this.event.filter)

        setTimeout(() => {
          if(this.event.revert)
            this.OBS.toggleFilter(!this.event.toggleTo, this.event.input.inputName? this.event.input.inputName : this.event.input, this.event.filter.filterName? this.event.filter.filterName : this.event.filter)
          this.onPlaybackEnded()
        }, ((+this.event.duration)|0) * 1000);
        break
      default:
        setTimeout(() => {
          this.onPlaybackEnded()
        }, 500);
    }
  
  }

  onPlaybackEnded() {
    this.events.eventsSubject.next({
      type: 'obs',
      what: 'ended'
    })
  }

}
