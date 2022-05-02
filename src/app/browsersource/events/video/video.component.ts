import {  Component, ElementRef, Input, ViewChild } from '@angular/core';
import { EventsService } from '../events.service'

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html'
})
export class VideoComponent {

  @Input() viewport: any
  @Input() event: any
  @ViewChild('videoPlayer') videoPlayer: ElementRef

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

    this.videoPlayer.nativeElement.play()
  }

  onError(error) {
    console.error(error)
    this.onPlaybackEnded()
  }

  onPlaybackEnded() {
    this.events.eventsSubject.next({
      type: 'video',
      what: 'ended'
    })
  }

}
