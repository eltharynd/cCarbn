import { Component, Input, OnInit } from '@angular/core'
import { SettingsService } from 'src/app/shared/settings.service'
import { AlertsService } from '../../../shared/alerts.service'
import { ElementsComponent, ELEMENT_ANIMATIONS_IN_INNER, ELEMENT_ANIMATIONS_OUT_INNER } from '../elements.component'

@Component({
  selector: 'app-gif',
  templateUrl: './gif.component.html',
  styleUrls: ['../elements.component.scss'],
  animations: [...ELEMENT_ANIMATIONS_IN_INNER, ...ELEMENT_ANIMATIONS_OUT_INNER],
})
export class GIFComponent implements OnInit {
  @Input() element: any

  constructor(private alerts: AlertsService, public settings: SettingsService) {}

  viewportStyle: any = {}
  outerStyle: any = {}
  innerStyle: any = {}
  ngOnInit() {
    this.innerStyle.width = this.element.width ? this.element.width + 'px' : this.element.mediaInformation?.width ? this.element.mediaInformation?.width + 'px' : 'fit-content'
    this.innerStyle.height = this.element.height ? this.element.height + 'px' : this.element.mediaInformation?.height ? this.element.mediaInformation?.height + 'px' : 'fit-content'

    if (this.element.border) {
      let stroke =
        this.element.borderStroke === 'thinner'
          ? 4
          : this.element.borderStroke === 'thin'
          ? 8
          : this.element.borderStroke === 'regular'
          ? 12
          : this.element.borderStroke === 'thick'
          ? 16
          : this.element.borderStroke === 'thicker'
          ? 20
          : this.element.borderStroke === 'thiccboi'
          ? 24
          : 12

      this.outerStyle.width = +(+(this.element.width || this.element.mediaInformation?.width || 1000) + 2 * stroke) + 'px'
      this.outerStyle.height = +(+(this.element.height || this.element.mediaInformation?.height || 1000) + 2 * stroke) + 'px'

      if (this.element.borderColor) {
        if (/rainbow/.test(this.element.borderColor)) {
          this.outerStyle.rainbow = true
        } else if (/vaporwave/.test(this.element.borderColor)) {
          this.outerStyle.vaporwave = true
        } else if (/custom/.test(this.element.borderColor)) {
          this.outerStyle.backgroundColor = this.element.borderCustomColor || '#daa520'
        } else {
          this.outerStyle.backgroundColor = this.element.borderColor || 'black'
        }
      }
      this.outerStyle.padding = `${+stroke}px`

      if (/roundedMore/.test(this.element.border)) {
        this.outerStyle.borderRadius = `${stroke * 1.5}px`
        this.innerStyle.borderRadius = `${stroke}px`
      } else if (/rounded/.test(this.element.border)) {
        this.outerStyle.borderRadius = `${Math.max(5, stroke / 2)}px`
        this.innerStyle.borderRadius = `${Math.max(4, stroke / 2)}px`
      } else if (/ellipse/.test(this.element.border)) {
        this.outerStyle.borderRadius = `50%`
        this.innerStyle.borderRadius = `50%`
      }
    } else {
      this.outerStyle.width = this.innerStyle.width
      this.outerStyle.height = this.innerStyle.height
    }

    this.viewportStyle = ElementsComponent.elementViewportStyle(this.settings.viewport, this.element, this.outerStyle, this.innerStyle)
  }

  onLoadedData() {
    this.element.loaded = true
    setTimeout(() => {
      this.onPlaybackEnded()
    }, (+this.element.duration || 5) * 1000)
  }

  onPlaybackEnded() {
    this.alerts.elementsSubject.next({
      type: 'gif',
      what: 'ended',
      element: this.element,
    })
  }
}
