import {  Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AlertsService } from '../../../shared/alerts.service'

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html'
})
export class VideoComponent implements OnInit {

  @Input() viewport: any
  @Input() element: any
  @ViewChild('videoPlayer') videoPlayer: ElementRef

  constructor(private alerts: AlertsService) {}

  style: any = {}
  ngOnInit() {
    this.style = {
      width: this.element.width ? this.element.width+'px' : 'fit-content',
      height: this.element.height ? this.element.height+'px' : 'fit-content',

      marginTop: this.element.marginTop ? this.element.marginTop+'px' : null,
      marginRight: this.element.marginRight ? this.element.marginRight+'px' : null,
      marginBottom: this.element.marginBottom ? this.element.marginBottom+'px' : null,
      marginLeft: this.element.marginLeft ? this.element.marginLeft+'px' : null,
    }
    this.processBorder()
  }

  processBorder() {
    if(this.element.borderRadius) {
      let thickness = this.element.border
      thickness = thickness === 'thinner' ? 
                  '2px' :
                    thickness === 'thin' ?
                    '4px' :
                      thickness === 'regular' ?
                      '6px' :
                        thickness === 'thick' ?
                        '8px' :
                          thickness === 'thicker' ?
                          '12px' : 
                            thickness === 'thiccboi' ?
                            '20px' : 
                              '6px'
      if(this.element.borderColor==='rainbow') {

      } else if(this.element.borderColor==='custom') {
        this.element.borderColor = this.element.borderCustom||'#daa520'
      } else {
        this.element.borderColor = 'black'
      }
      let radius = this.element.borderRadius
      radius = radius === 'squared' ?
              null :
                radius === 'ellipse' ?
                '50%' :
                  radius === 'rounded' ?
                  '8px' :
                    radius === 'rounded2' ?
                    '20px' :
                      null 
      
      if(radius) {
        this.style.borderRadius = radius
      }
      this.style.border = `${thickness} solid ${this.element.borderColor}`
    }
  }


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
