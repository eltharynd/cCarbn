
import { Component, Input } from '@angular/core';
import { AlertsService } from '../../../shared/alerts.service'

@Component({
  selector: 'app-gif',
  templateUrl: './gif.component.html'
})
export class GIFComponent {

  @Input() viewport: any
  @Input() element: any

  constructor(private alerts: AlertsService) {}

  alignItems
  justifyContent
  onLoadedData() {
    this.alignItems = null
    this.justifyContent = null
    console.log(this.element)
    if(this.element.position) {
      if(/TOP/.test(this.element.position)) {
        this.alignItems = 'flex-start'
      } else if(/BOTTOM/.test(this.element.position)) {
        this.alignItems = 'flex-end'
      } 

      if(/LEFT/.test(this.element.position)) {
        this.justifyContent = 'flex-start'
      } else if(/RIGHT/.test(this.element.position)) {
        this.justifyContent = 'flex-end'
      } 
    }

    setTimeout(() => {
      console.log('ending', (+this.element.duration|0)*1000)
      this.onPlaybackEnded()
    }, (+this.element.duration||5)*1000);
  }

  onPlaybackEnded() {
    this.alerts.elementsSubject.next({
      type: 'gif',
      what: 'ended'
    })
  }

}
