import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { EventsService } from '../events.service'

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html'
})
export class AudioComponent {

  @Input() audio: any
  @ViewChild('audioPlayer') audioPlayer: ElementRef

  constructor(private events: EventsService) {}

  alignItems
  justifyContent
  onLoadedData() {
    this.audioPlayer.nativeElement.play()
  }

  onPlaybackEnded() {
    this.events.eventsSubject.next({
      type: 'audio',
      what: 'ended'
    })
  }

}
