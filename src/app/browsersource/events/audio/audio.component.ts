import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { EVENT_ANIMATIONS } from '../events.component'
import { EventsService } from '../events.service'

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  animations: EVENT_ANIMATIONS
})
export class AudioComponent {

  @Input() event: any
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
