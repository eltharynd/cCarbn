import {  Component, ElementRef, Input, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { AlertsService } from '../../../shared/alerts.service'
import { ElementsComponent, ELEMENT_ANIMATIONS_IN, ELEMENT_ANIMATIONS_OUT_INNER } from '../elements.component'

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['../elements.component.scss'],
  animations: [ ...ELEMENT_ANIMATIONS_IN, ...ELEMENT_ANIMATIONS_OUT_INNER]
})
export class ClipComponent implements OnInit {

  @Input() viewport: any
  @Input() element: any
  @ViewChild('clipPlayer') clipPlayer: ElementRef

  constructor(private alerts: AlertsService, private sanitizer: DomSanitizer) {}

  viewportStyle: any = {}
  outerStyle: any = {}
  innerStyle: any = {}
  ngOnInit() {

    console.log('clip', this.element)
    
    this.element.src = this.sanitizer.bypassSecurityTrustResourceUrl(this.element.alertData.randomClip.embed_url + '&parent=ccarbn.io&parent=localhost')

    this.innerStyle.width = this.element.width ? this.element.width+'px' : this.element.mediaInformation?.width ? this.element.mediaInformation?.width+'px' : 'fit-content'
    this.innerStyle.height = this.element.height ? this.element.height+'px' : this.element.mediaInformation?.height ? this.element.mediaInformation?.height+'px' : 'fit-content'

    if(this.element.border) {
      let stroke = this.element.borderStroke === 'thinner' ? 4 :
                      this.element.borderStroke === 'thin' ? 8 :
                        this.element.borderStroke === 'regular' ? 12 :
                          this.element.borderStroke === 'thick' ? 16 :
                            this.element.borderStroke === 'thicker' ? 20 : 
                              this.element.borderStroke === 'thiccboi' ? 24 : 
                                12

      this.outerStyle.width = +(+(this.element.width||this.element.mediaInformation?.width||1000) + 2*stroke) + 'px'
      this.outerStyle.height = +(+(this.element.height||this.element.mediaInformation?.height||1000) + 2*stroke) + 'px'

      if(this.element.borderColor) {
        if(/rainbow/.test(this.element.borderColor)) {
          this.outerStyle.rainbow = true
        } else if(/vaporwave/.test(this.element.borderColor)) {
          this.outerStyle.vaporwave = true
        } else if(/custom/.test(this.element.borderColor)) {
          this.outerStyle.backgroundColor = this.element.borderCustomColor||'#daa520'
        } else {
          this.outerStyle.backgroundColor = this.element.borderColor||'black'
        }
      }
      this.outerStyle.padding = `${+stroke}px`

      if(/roundedMore/.test(this.element.border)) {
        this.outerStyle.borderRadius = `${stroke*1.5}px`
        this.innerStyle.borderRadius = `${stroke}px`
      } else if(/rounded/.test(this.element.border)) {
        this.outerStyle.borderRadius = `${Math.max(5, stroke/2)}px`
        this.innerStyle.borderRadius = `${Math.max(4, stroke/2)}px`
      } else if(/ellipse/.test(this.element.border)) {
        
      }
    } else {
      this.outerStyle.width = this.outerStyle.width
      this.outerStyle.height = this.outerStyle.height
    }

    this.viewportStyle = ElementsComponent.elementViewportStyle(this.viewport, this.element, this.outerStyle)
  }

  loaded: boolean
  onLoadedData() {
    this.loaded = true
    this.clipPlayer.nativeElement.play()
  }

  onError(error) {
    return
    console.error(error)
    this.onPlaybackEnded()
  }

  onPlaybackEnded() {
    return
    this.alerts.elementsSubject.next({
      type: 'clip',
      what: 'ended',
      element: this.element
    })
  }

}
