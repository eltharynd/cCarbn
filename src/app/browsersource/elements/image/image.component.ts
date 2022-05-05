import { Component, Input, OnInit } from '@angular/core';
import { AlertsService } from '../../../shared/alerts.service'
import { ELEMENT_ANIMATIONS_IN, ELEMENT_ANIMATIONS_OUT_INNER } from '../elements.component'

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  animations: [ ...ELEMENT_ANIMATIONS_IN, ...ELEMENT_ANIMATIONS_OUT_INNER]
})
export class ImageComponent implements OnInit {

  @Input() viewport: any
  @Input() element: any

  constructor(private alerts: AlertsService) {}

  ready
  style: any = {}
  ngOnInit() {
    this.style = {
      width: this.element.width ? this.element.width+'px' : this.element.mediaInformation?.width ? this.element.mediaInformation?.width+'px' : 'fit-content',
      height: this.element.height ? this.element.height+'px' : this.element.mediaInformation?.height ? this.element.mediaInformation?.height+'px' : 'fit-content',

      marginTop: this.element.marginTop ? this.element.marginTop+'px' : 0,
      marginRight: this.element.marginRight ? this.element.marginRight+'px' : 0,
      marginBottom: this.element.marginBottom ? this.element.marginBottom+'px' : 0,
      marginLeft: this.element.marginLeft ? this.element.marginLeft+'px' : 0,
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

    this.ready = true
    setTimeout(() => {
      this.onPlaybackEnded()
    }, (+this.element.duration|5)*1000);
  }

  onPlaybackEnded() {
    this.alerts.elementsSubject.next({
      type: 'image',
      what: 'ended'
    })
  }

}
