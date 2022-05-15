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
    
    if(!this.OBS.isOBS) {
      setTimeout(() => {
        this.onPlaybackEnded()
      }, ((+this.element.duration)||0) * 1000);
      return
    }
    
    switch (this.element.trigger) {
      case 'sourceVisibility':

        let sceneName = this.element.sourceNested ? this.element.source.sourceName : this.element.scene?.sceneName
        let sourceName =this.element.sourceNested ? this.element.sourceNested.sourceName : this.element.source?.sourceName 

        this.OBS.toggleSource(this.element.toggleTo, sceneName, sourceName)

        setTimeout(() => {
          if(this.element.revert)
            this.OBS.toggleSource(!this.element.toggleTo, sceneName, sourceName)
          this.onPlaybackEnded()
        }, ((+this.element.duration)||0) * 1000);
        break
      case 'filterVisibility':

        let inputName = this.element.input?.sceneName ? this.element.input.sceneName : this.element.input?.inputName
        let filterName = this.element.filter?.filterName
    
        this.OBS.toggleFilter(this.element.toggleTo, inputName, filterName)

        setTimeout(() => {
          if(this.element.revert)
            this.OBS.toggleFilter(!this.element.toggleTo, inputName, filterName)
          this.onPlaybackEnded()
        }, ((+this.element.duration)||0) * 1000);
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
      what: 'ended',
      element: this.element
    })
  }

}
