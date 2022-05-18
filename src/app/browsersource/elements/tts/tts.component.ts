import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core'
import { DataService, SERVER_URL } from 'src/app/shared/data.service'
import { AlertsService } from '../../../shared/alerts.service'

@Component({
  selector: 'app-tts',
  templateUrl: './tts.component.html',
  styleUrls: ['../elements.component.scss'],
})
export class TTSComponent implements OnInit {
  @Input() element: any
  @ViewChild('ttsPlayer') ttsPlayer: ElementRef
  encodedTTS

  constructor(private alerts: AlertsService, private data: DataService) {}
  async ngOnInit() {
    this.encodedTTS = `${SERVER_URL}tts/${this.data._userId}/${this.element.voice ? this.element.voice : 'en-us'}/${encodeURI(this.element.text.replace(/\?/g, '&questionmark;'))}`
  }

  alignItems
  justifyContent
  onLoadedData() {
    this.ttsPlayer.nativeElement.play()
  }

  onError(error) {
    console.error(error)
    this.onPlaybackEnded()
  }

  onPlaybackEnded() {
    this.alerts.elementsSubject.next({
      type: 'tts',
      what: 'ended',
      element: this.element,
    })
  }
}
