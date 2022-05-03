import { Component, Input, OnInit } from '@angular/core';
import { OBSService } from 'src/app/shared/obs.service'
import { AlertsService } from '../../../shared/alerts.service'

@Component({
  selector: 'app-obs',
  template: '<div class="container">&nbsp;</div>'
})
export class ObsComponent implements OnInit {

  @Input() element: any


  constructor(private alerts: AlertsService, private OBS: OBSService) { }
  async ngOnInit() {

    if(this.element.duration)
     try { parseFloat(this.element.duration) } catch(e) { this.element.duration = null }
     
    switch (this.element.trigger) {
      case 'sourceVisibility':
        this.OBS.toggleSource(this.element.toggleTo, this.element.scene.sceneName ? this.element.scene.sceneName : this.element.scene, this.element.source.sourceName? this.element.source.sourceName : this.element.source)

        setTimeout(() => {
          console.log('tick', this.element.duration, +this.element.duration|0)
          if(this.element.revert)
            this.OBS.toggleSource(!this.element.toggleTo, this.element.scene.sceneName ? this.element.scene.sceneName : this.element.scene, this.element.source.sourceName? this.element.source.sourceName : this.element.source)
          this.onPlaybackEnded()
        }, ((+this.element.duration)|500) * 1000);
        break
      case 'filterVisibility':
        this.OBS.toggleFilter(this.element.toggleTo, this.element.input.inputName? this.element.input.inputName : this.element.input, this.element.filter.filterName? this.element.filter.filterName : this.element.filter)

        setTimeout(() => {
          if(this.element.revert)
            this.OBS.toggleFilter(!this.element.toggleTo, this.element.input.inputName? this.element.input.inputName : this.element.input, this.element.filter.filterName? this.element.filter.filterName : this.element.filter)
          this.onPlaybackEnded()
        }, ((+this.element.duration)|0) * 1000);
        break
      default:
        setTimeout(() => {
          this.onPlaybackEnded()
        }, 500);
    }
  
  }

  onPlaybackEnded() {
    this.alerts.elementsSubject.next({
      type: 'obs',
      what: 'ended'
    })
  }

}
