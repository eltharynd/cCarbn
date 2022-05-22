import { animate, animateChild, group, query, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core'
import { HypetrainService } from 'src/app/shared/hypetrain.service'
import { OBSService } from 'src/app/shared/obs.service'
import { PredictionsService } from 'src/app/shared/predictions.service'
import { SettingsService } from 'src/app/shared/settings.service'
import { AlertsService } from '../../shared/alerts.service'

export enum POSITION {
  TOP_LEFT = 'TOP_LEFT',
  TOP = 'TOP',
  TOP_RIGHT = 'TOP_RIGHT',
  LEFT = 'LEFT',
  CENTER = 'CENTER',
  RIGHT = 'RIGHT',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM = 'BOTTOM',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT',

  COVER = 'Cover',
  FIT = 'Fit',
  MANUAL = 'Manual XY',
  RANDOM = 'Random',
}

export const BORDER = {
  types: {
    squared: 'Squared',
    rounded: 'Rounded',
    roundedMore: 'Rounded More',
    ellipse: 'Ellipse',
  },
  thickness: {
    thinner: 'Thinner',
    thin: 'Thin',
    regular: 'Regular',
    thick: 'Thick',
    thicker: 'Thicker',
    thiccboi: 'Thiccboi',
  },
  color: {
    black: 'Black',
    white: 'White',
    transparent: 'Transparent',
    rainbow: 'Rainbow',
    vaporwave: 'Vaporwave',
    custom: 'Custom',
  },
}

export enum TRANSITION {
  NONE = 'None',
  FADE = 'Fade',
  EXPAND = 'Expand',
  EXPAND_HOR = 'Expand Horizontally',
  EXPAND_VER = 'Expand Vertically',
  POP_UP = 'Pop upwards',
  POP_DOWN = 'Pop downwards',
  UNPOP_UP = 'Unpop upwards',
  UNPOP_DOWN = 'Unpop downwards',
  SWIPE_LEFT = 'Swipe left',
  SWIPE_RIGHT = 'Swipe right',
}

export const ELEMENT_ANIMATIONS_IN = [
  trigger('in', [
    transition('void => loading', []),

    transition(`loading => FADE`, [style({ opacity: 0 }), animate('500ms ease', style({}))]),

    transition(`loading => POP_UP`, [style({ opacity: 0, transform: 'translateX(-10px) translateY(30px)' }), animate('500ms ease', style({}))]),
    transition(`loading => POP_DOWN`, [style({ opacity: 0, transform: 'translateX(-10px) translateY(-30px)' }), animate('500ms ease', style({}))]),

    transition(`loading => UNPOP_UP`, [style({ opacity: 0, transform: 'translateX(10px) translateY(30px)' }), animate('500ms ease', style({}))]),

    transition(`loading => UNPOP_DOWN`, [style({ opacity: 0, transform: 'translateX(10px) translateY(-30px)' }), animate('500ms ease', style({}))]),

    transition(`loading => SWIPE_RIGHT`, [style({ opacity: 0, transform: 'rotate(90deg) translateX(-2000px)' }), animate('500ms ease', style({}))]),
    transition(`loading => SWIPE_LEFT`, [style({ opacity: 0, transform: 'rotate(-90deg) translateX(2000px)' }), animate('500ms ease', style({}))]),
    transition(`:enter`, [group([query('@*', [animateChild()])])]),
  ]),
]
export const ELEMENT_ANIMATIONS_IN_INNER = [
  trigger('innerIN', [
    transition(`loading => EXPAND`, [style({ opacity: 0, transform: 'scale(0)' }), animate('500ms ease', style({}))]),
    transition(`loading => EXPAND_HOR`, [style({ opacity: 0, transform: 'scaleX(0)' }), animate('500ms ease', style({}))]),
    transition(`loading => EXPAND_VER`, [style({ opacity: 0, transform: 'scaleY(0)' }), animate('500ms ease', style({}))]),
  ]),
]

export const ELEMENT_ANIMATIONS_OUT = [
  trigger('out', [
    transition('FADE => void', [style({}), animate('500ms ease', style({ opacity: 0 }))]),

    transition('POP_DOWN => void', [style({}), animate('500ms ease', style({ opacity: 0, transform: 'translateX(10px) translateY(30px)' }))]),
    transition('POP_UP => void', [style({}), animate('500ms ease', style({ opacity: 0, transform: 'translateX(10px) translateY(-30px)' }))]),

    transition('UNPOP_UP => void', [style({}), animate('500ms ease', style({ opacity: 0, transform: 'translateX(-10px) translateY(-30px)' }))]),

    transition('UNPOP_DOWN => void', [style({}), animate('500ms ease', style({ opacity: 0, transform: 'translateX(-10px) translateY(30px)' }))]),

    transition('SWIPE_LEFT => void', [style({}), animate('500ms ease', style({ opacity: 0, transform: 'rotate(90deg) translateX(-2000px)' }))]),
    transition('SWIPE_RIGHT => void', [style({}), animate('500ms ease', style({ opacity: 0, transform: 'rotate(-90deg) translateX(2000px)' }))]),
    transition(`:leave`, [group([query('@*', [animateChild()])])]),
  ]),
]
export const ELEMENT_ANIMATIONS_OUT_INNER = [
  trigger('innerOUT', [
    transition(`EXPAND => void`, [style({}), animate('500ms ease', style({ opacity: 0, transform: 'scale(0)' }))]),
    transition(`EXPAND_HOR => void`, [style({}), animate('500ms ease', style({ opacity: 0, transform: 'scaleX(0)' }))]),
    transition(`EXPAND_VER => void`, [style({}), animate('500ms ease', style({ opacity: 0, transform: 'scaleY(0)' }))]),
  ]),
]

@Component({
  selector: 'app-elements',
  templateUrl: './elements.component.html',
  animations: [...ELEMENT_ANIMATIONS_IN, ...ELEMENT_ANIMATIONS_OUT],
})
export class ElementsComponent implements OnInit {
  currentElements: any[] = []

  constructor(private alerts: AlertsService, public OBS: OBSService, public hypetrain: HypetrainService, public predictions: PredictionsService, public settings: SettingsService) {
    alerts.elementsSubject.subscribe((element) => {
      switch (element.what) {
        case 'start':
          if (/EXPAND/.test(element.transitionIN)) {
            element.innerTransitionIN = element.transitionIN
            //delete element.transitionIN
          }
          if (/EXPAND/.test(element.transitionOUT)) {
            element.innerTransitionOUT = element.transitionOUT
            //delete element.transitionOUT
          }
          this.currentElements.push(element)
          break
        case 'ended':
          this.currentElements.splice(this.currentElements.indexOf(element.element), 1)
          break
      }
    })
  }

  cantPlay = false
  async ngOnInit() {
    if (!this.OBS.isOBS) {
      let audio = new Audio()
      audio.play().catch((e) => {
        this.cantPlay = true
        let listener = (click) => {
          this.cantPlay = false
          window.removeEventListener('click', listener)
        }
        window.addEventListener('click', listener)
      })
    }
  }

  public static elementViewportStyle(viewport, element, outerStyle?, innerStyle?): any {
    let style: any = {}
    style.width = +viewport.width - +viewport.padding * 2 + 'px'
    style.height = +viewport.height - +viewport.padding * 2 + 'px'

    if (element.position) {
      if (/COVER/.test(element.position) || /FIT/.test(element.position)) {
        try {
          style.width = `${+viewport.width}px`
          style.height = `${+viewport.height}px`

          outerStyle.width = `${+viewport.width}px`
          outerStyle.height = `${+viewport.height}px`
          outerStyle.left = `-${viewport.padding}px`
          outerStyle.top = `-${viewport.padding}px`

          if (/COVER/.test(element.position)) {
            let _sourceWidth = +(element.width || element.mediaInformation?.width || 1280)
            let _sourceHeight = +(element.width || element.mediaInformation?.height || 1280)
            let _targetWidth = +viewport.width
            let _targetHeight = +viewport.height
            let _newWidth
            let _newHeight

            let ratio = _sourceWidth / _sourceHeight

            if (_sourceWidth >= _sourceHeight) {
              _newHeight = _targetHeight
              _newWidth = _targetHeight * ratio

              style.width = `${_newWidth}px`
              outerStyle.width = `${_newWidth}px`
              outerStyle.left = `-${viewport.padding + (_newWidth - _targetWidth) / 2}px`
            } else {
              _newWidth = _targetWidth
              _newHeight = _targetWidth * ratio

              style.height = `${_newHeight}px`
              outerStyle.height = `${_newHeight}px`
              outerStyle.top = `-${viewport.padding + (_newHeight - _targetHeight) / 2}px`
            }

            innerStyle.width = `${_newWidth}px`
            innerStyle.height = `${_newHeight}px`
          } else {
            innerStyle.width = `${+viewport.width}px`
            innerStyle.height = `${+viewport.height}px`
          }
        } catch (e) {}
      } else if (/MANUAL/.test(element.position) || /RANDOM/.test(element.position)) {
        try {
          let _width = parseInt(outerStyle.width.replace('px', ''))
          let _height = parseInt(outerStyle.height.replace('px', ''))

          let _targetX = +element.targetX
          let _targetY = +element.targetY
          if (/RANDOM/.test(element.position)) {
            _targetX = Math.random() * (viewport.width - _width) + _width / 2
            _targetY = Math.random() * (viewport.height - _height) + _height / 2
          }

          style.paddingLeft = `${_targetX - _width / 2}px`
          style.paddingTop = `${_targetY - _height / 2}px`

          if (element.ignorePadding) {
            style.position = 'absolute'
            style.top = 0
            style.left = 0
          }
        } catch (e) {}
      } else {
        style.display = 'flex'
        style.alignItems = 'center'
        style.justifyContent = 'center'
      }

      if (/TOP/.test(element.position)) {
        style.alignItems = 'flex-start'
      } else if (/BOTTOM/.test(element.position)) {
        style.alignItems = 'flex-end'
      }

      if (/LEFT/.test(element.position)) {
        style.justifyContent = 'flex-start'
      } else if (/RIGHT/.test(element.position)) {
        style.justifyContent = 'flex-end'
      }
    } else {
      style.display = 'flex'
      style.alignItems = 'center'
      style.justifyContent = 'center'
    }

    outerStyle.marginLeft = `${element.offsetX}px`
    outerStyle.marginTop = `${element.offsetY}px`

    return style
  }
}
