import {  Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AlertsService } from '../alerts.service'

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html'
})
export class VideoComponent {

  @Input() viewport: any
  @Input() element: any
  @ViewChild('videoPlayer') videoPlayer: ElementRef

  constructor(private alerts: AlertsService) {}

  alignItems
  justifyContent
  onLoadedData() {
    this.alignItems = null
    this.justifyContent = null
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

    this.videoPlayer.nativeElement.play()
  }

  onError(error) {
    console.error(error)
    this.onPlaybackEnded()
  }

  onPlaybackEnded() {
    this.alerts.elementsSubject.next({
      type: 'video',
      what: 'ended'
    })
  }

}
