import { animate, style, transition, trigger } from '@angular/animations'
import {  Component, ElementRef, Input, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { AlertsService } from '../../../shared/alerts.service'
import { ElementsComponent, ELEMENT_ANIMATIONS_IN_INNER, ELEMENT_ANIMATIONS_OUT_INNER } from '../elements.component'

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['../elements.component.scss'],
  animations: [ ...ELEMENT_ANIMATIONS_IN_INNER, ...ELEMENT_ANIMATIONS_OUT_INNER,
    trigger('delayed', [
      transition('void => FADE', [
        style({opacity: 0}),
        animate('5000ms ease', style({}))
      ])
    ])
  ]
})
export class ClipComponent implements OnInit {

  @Input() viewport: any
  @Input() element: any
  @ViewChild('clipPlayer') clipPlayer: ElementRef

  clip
  cantDisplay

  constructor(private alerts: AlertsService, private sanitizer: DomSanitizer) {}

  viewportStyle: any = {}
  outerStyle: any = {}
  innerStyle: any = {}
  ngOnInit() {

    if(!this.element.playerScale) this.element.playerScale = 100

    let width = +this.element.playerScale/100 * 512
    let height = +this.element.playerScale/100 * 288
    
    this.innerStyle.width = `${width}px`
    this.innerStyle.height = `${height}px`

    if(this.element.which === 'random') this.clip = this.element.alertData?.randomClip
    else if(this.element.which === 'topClip') this.clip = this.element.alertData?.topClip

    if(!this.clip) {

      this.innerStyle.backgroundColor = '#0b0b0c'
      this.innerStyle.color = 'white'
      this.innerStyle.display = 'flex'
      this.innerStyle.justifyContent = 'center'
      this.innerStyle.alignItems = 'center'
      this.innerStyle.fontSize = '1.2rem';
      this.innerStyle.lineHeight = '1.4rem';
      this.innerStyle.textAlign = 'center';
      this.innerStyle.fontFamily = 'monospace';
      

      setTimeout(() => {
        this.cantDisplay = true
        setTimeout(() => {
          this.element.loaded = true
        }, 500);
        setTimeout(() => {
          this.onPlaybackEnded()
        }, 5 * 1000);

      }, (+this.element.delay || 0 ) * 1000);
    } else {
      setTimeout(() => {
        this.element.src = this.sanitizer.bypassSecurityTrustResourceUrl(this.clip.embed_url + 
          `&width=${this.element.playerScale/100*512}` + 
          `&height=${this.element.playerScale/100*288}` +
          '&parent=ccarbn.io' +
          '&autoplay=true' +
          '&muted=false' +
          '&preload=auto' +
          '&controls=false'
        )
      }, (+this.element.delay || 0 ) * 1000);

    }
    
    if(this.element.border) {
      let stroke = this.element.borderStroke === 'thinner' ? 4 :
                      this.element.borderStroke === 'thin' ? 8 :
                        this.element.borderStroke === 'regular' ? 12 :
                          this.element.borderStroke === 'thick' ? 16 :
                            this.element.borderStroke === 'thicker' ? 20 : 
                              this.element.borderStroke === 'thiccboi' ? 24 : 
                                12

      this.outerStyle.width = (width + 2*stroke) + 'px'
      this.outerStyle.height = (height + 2*stroke) + 'px'

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
      this.outerStyle.width = this.innerStyle.width
      this.outerStyle.height = this.innerStyle.height
    }
    this.viewportStyle = ElementsComponent.elementViewportStyle(this.viewport, this.element, this.outerStyle)
  }

  onLoadedData() {
    this.element.loaded = true
    setTimeout(() => {
      this.onPlaybackEnded()
    }, +this.clip.duration * 1000);
  }

  onError(error) {
    console.error(error)
    this.onPlaybackEnded()
  }

  onPlaybackEnded() {
    this.alerts.elementsSubject.next({
      type: 'clip',
      what: 'ended',
      element: this.element
    })
  }

}
