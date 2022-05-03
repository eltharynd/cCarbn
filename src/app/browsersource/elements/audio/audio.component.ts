import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { AlertsService } from '../../../shared/alerts.service'

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html'
})
export class AudioComponent {

  @Input() element: any
  @ViewChild('audioPlayer') audioPlayer: ElementRef

  constructor(private alerts: AlertsService) {}

  alignItems
  justifyContent
  onLoadedData() {
    this.audioPlayer.nativeElement.play()
  }

  onError(error) {
    console.error(error)
    this.onPlaybackEnded()
  }

  onPlaybackEnded() {
    this.alerts.elementsSubject.next({
      type: 'audio',
      what: 'ended'
    })
  }

}
