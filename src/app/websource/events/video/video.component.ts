import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { EventsService } from '../events.service'

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html'
})
export class VideoComponent {

  @Input() viewport: any
  @Input() video: any
  @ViewChild('videoPlayer') videoPlayer: ElementRef

  constructor(private events: EventsService) {}

  alignItems
  justifyContent
  onLoadedData() {
    this.alignItems = null
    this.justifyContent = null
    if(this.video.position) {
      if(/TOP/.test(this.video.position)) {
        this.alignItems = 'flex-start'
      } else if(/BOTTOM/.test(this.video.position)) {
        this.alignItems = 'flex-end'
      } 

      if(/LEFT/.test(this.video.position)) {
        this.justifyContent = 'flex-start'
      } else if(/RIGHT/.test(this.video.position)) {
        this.justifyContent = 'flex-end'
      } 
    }

    this.videoPlayer.nativeElement.play()
  }

  onPlaybackEnded() {
    this.events.eventsSubject.next({
      type: 'video',
      what: 'ended'
    })
  }

}
