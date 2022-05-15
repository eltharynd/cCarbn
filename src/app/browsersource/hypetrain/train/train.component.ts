import { Component, Input, OnChanges, OnInit } from '@angular/core'
import { animate, animateChild, AnimationStateMetadata, group, query, state, style, transition, trigger } from '@angular/animations'
import { HypetrainService } from 'src/app/shared/hypetrain.service'
import { SettingsService } from 'src/app/shared/settings.service'

let _shakeKeyframes = 60

let _dScaleX = 0.02
let _rndScaleX: number[] = []
for (let i = 0; i < _shakeKeyframes; i++) _rndScaleX.push(Math.random() * _dScaleX * 2 - _dScaleX + 1)

let _dScaleY = 0.05
let _rndScaleY: number[] = []
for (let i = 0; i < _shakeKeyframes; i++) _rndScaleY.push(Math.random() * _dScaleY * 2 - _dScaleY + 1)

let _dTranslateX = 3
let _rndTranslateX: string[] = []
for (let i = 0; i < _shakeKeyframes; i++) _rndTranslateX.push(`${Math.floor(Math.random() * _dTranslateX * 2 - _dTranslateX)}%`)
let _dTranslateY = 5
let _rndTranslateY: string[] = []
for (let i = 0; i < _shakeKeyframes; i++) _rndTranslateY.push(`${Math.floor(Math.random() * _dTranslateY * 2 - _dTranslateY)}%`)

let _dRotate = 3
let _rndRotate: string[] = []
for (let i = 0; i < _shakeKeyframes; i++) _rndRotate.push(`${Math.random() * _dRotate * 2 - _dRotate}deg`)

let _dSkew = 3
let _rndSkew: string[] = []
for (let i = 0; i < 2 * _shakeKeyframes; i++) _rndSkew.push(`${Math.random() * _dSkew * 2 - _dSkew}deg`)

let states: AnimationStateMetadata[] = []
for (let i = 0; i < _shakeKeyframes; i++)
  states.push(
    state(
      `${i}`,
      style({
        transform: `
            scaleX(${_rndScaleX[i]}) scaleY(${_rndScaleY[i]})
            translateX(${_rndTranslateX[i]}) translateY(${_rndTranslateY[i]})
            rotateZ(${_rndRotate[i]})
            skewX(${_rndSkew[i]}) skewY(${_rndSkew[i + 1]})
        `,
      })
    )
  )

@Component({
  template: '',
  animations: [
    trigger('shake', [...states, transition('* <=> *', [animate(160)])]),
    trigger('entry', [
      state(
        'void',
        style({
          transform: 'translateX(calc({{viewportWidth}}px + 100%))',
        }),
        { params: { viewportWidth: 100 } }
      ),
      state(
        'entering',
        style({
          transform: 'translateX(calc({{viewportWidth}}px + 100%))',
        }),
        { params: { viewportWidth: 100 } }
      ),
      state(
        'entered',
        style({
          transform: 'translateX(0)',
        })
      ),
      transition('entering <=> entered', [animate('3s ease-out')]),
      transition('entered <=> *', [animate(10), group([animate(2000), style({}), query('@shake', [animateChild()])])]),
    ]),
  ],
})
export class TrainComponent implements OnInit, OnChanges {
  @Input() user: { name: string; picture: string; total?: number }
  _pictureBounds: { top: number; left: number; width: number; height: number }

  entryState: any = { value: 'void', params: { viewportWidth: 100 } }
  shakeState: number = 0
  shakeKeyframes: number = _shakeKeyframes

  type: string = 'locomotive'

  constructor(public hypetrain: HypetrainService, public settings: SettingsService) {}

  async ngOnInit() {
    await this.resizePicture()
    this.settings.updated.subscribe(() => {
      this.resizePicture()
    })
  }
  async ngOnChanges() {
    await this.resizePicture()
  }

  async resizePicture() {
    let scale = this.type === 'locomotive' ? this.hypetrain.currentLocomotiveScale : this.hypetrain.currentCarriageScale
    let newPicSize = {
      width:
        (((this.settings.hypetrain.train[this.type].pictureBounds.width || this.settings.hypetrain.train[this.type].size.width) * (scale || 100)) / 100) *
        (this.settings.hypetrain.train[this.type].pictureBounds.scale / 100 || 100),
      height:
        (((this.settings.hypetrain.train[this.type].pictureBounds.height || this.settings.hypetrain.train[this.type].size.height) * (scale || 100)) / 100) *
        (this.settings.hypetrain.train[this.type].pictureBounds.scale / 100 || 100),
    }

    this._pictureBounds = {
      top:
        (this.settings.hypetrain.train[this.type].pictureBounds.top! * scale) / 100 +
        ((this.settings.hypetrain.train[this.type].pictureBounds.height! * scale) / 100 - newPicSize.height) / 2,
      left:
        (this.settings.hypetrain.train[this.type].pictureBounds.left! * scale) / 100 +
        ((this.settings.hypetrain.train[this.type].pictureBounds.width! * scale) / 100 - newPicSize.width) / 2,
      width: newPicSize.width,
      height: newPicSize.height,
    }
  }

  async animationProgress() {
    if (this.entryState.value !== 'entered')
      this.entryState =
        this.entryState.value === 'void'
          ? {
              value: 'entering',
              params: { viewportWidth: this.settings.viewport.width - this.settings.hypetrain.train.start.x - this.settings.hypetrain.train[this.type].size.width },
            }
          : this.entryState.value === 'entering'
          ? { value: 'entered' }
          : this.entryState
  }
}
