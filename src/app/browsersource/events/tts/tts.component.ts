import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SERVER_URL } from 'src/app/shared/data.service'
import { EventsService } from '../events.service'

@Component({
  selector: 'app-tts',
  templateUrl: './tts.component.html'
})
export class TTSComponent implements OnInit {

  @Input() event: any
  @ViewChild('ttsPlayer') ttsPlayer: ElementRef
  encodedTTS

  constructor(private events: EventsService) { }
  async ngOnInit() {
    this.encodedTTS = `${SERVER_URL}tts/${this.event.voice ? this.event.voice : 'us'}/${encodeURI(this.event.text.replace(/\?/g, '&questionmark;'))}`
  }

  alignItems
  justifyContent
  onLoadedData() {
    this.ttsPlayer.nativeElement.play()
  }

  onPlaybackEnded() {
    this.events.eventsSubject.next({
      type: 'tts',
      what: 'ended'
    })
  }

}
