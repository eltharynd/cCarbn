import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs'

@Component({
  selector: 'app-clip',
  template: `
    <div id="container" [ngStyle]="{
      top: format.y + 'px',
      left: format.x + 'px'
    }">
      <video #videoPlayer (loadeddata)="onLoadedData()" (ended)="onPlaybackEnded()">
        <source [src]="source">
      </video>  
    </div>
  `,
  styles: [`
    #container {
      position: fixed;
    }
  `]
})
export class ClipComponent {

  @ViewChild('videoPlayer') videoPlayer: ElementRef
  @Input() source: string
  @Input() controller: Subject<any>

  format: any = {
    width: 720,
    height: 420,
    x: 0,
    y: 0,
  }

  onLoadedData() {
    this.controller.subscribe((data) => {
      if(data === 'play') 
        this.videoPlayer.nativeElement.play()
      else if(typeof data !== 'string')
        for(let key of Object.keys(data)) 
          this.format[key] = data[key]
    })

    this.format.width = this.videoPlayer.nativeElement.videoWidth
    this.format.height = this.videoPlayer.nativeElement.videoHeight
    this.controller.next({
      event: 'loaded',
      format: this.format
    })
  }

  onPlaybackEnded() {
    this.controller.next('ended')
  }

}
