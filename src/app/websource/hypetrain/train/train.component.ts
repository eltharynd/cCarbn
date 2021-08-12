import { Component, Input, OnChanges, OnInit } from "@angular/core"
import { animate, animation, AnimationReferenceMetadata, AnimationStateMetadata, keyframes, state, style, transition, trigger } from '@angular/animations'
import { from } from "rxjs"
import { toArray } from "rxjs/operators"

let _keyframes = 60

let _dScaleX = .02
let _rndScaleX: number[] = []
for (let i=0;i<_keyframes;i++) _rndScaleX.push(Math.random()*_dScaleX*2 - _dScaleX + 1)

let _dScaleY = .05
let _rndScaleY: number[] = []
for (let i=0;i<_keyframes;i++) _rndScaleY.push(Math.random()*_dScaleY*2 - _dScaleY + 1)

let _dTranslateX = 3
let _rndTranslateX: string[] = []
for (let i=0;i<_keyframes;i++) _rndTranslateX.push(`${Math.floor(Math.random()*_dTranslateX*2 - _dTranslateX)}%`)
let _dTranslateY = 5
let _rndTranslateY: string[] = []
for (let i=0;i<_keyframes;i++) _rndTranslateY.push(`${Math.floor(Math.random()*_dTranslateY*2 - _dTranslateY)}%`)

let _dRotate = 3
let _rndRotate: string[] = []
for (let i=0;i<_keyframes;i++) _rndRotate.push(`${Math.random()*_dRotate*2 - _dRotate}deg`)

let _dSkew = 3
let _rndSkew: string[] = []
for (let i=0;i<2*_keyframes;i++) _rndSkew.push(`${Math.random()*_dSkew*2 - _dSkew}deg`)


let states: AnimationStateMetadata[] = []
for(let i=0;i<_keyframes;i++) states.push(
    state(`${i}`, style({
        transform: `
            scaleX(${_rndScaleX[i]}) scaleY(${_rndScaleY[i]})
            translateX(${_rndTranslateX[i]}) translateY(${_rndTranslateY[i]})
            rotateZ(${_rndRotate[i]})
            skewX(${_rndSkew[i]}) skewY(${_rndSkew[i+1]})
        `
    }))
)


@Component({
    template: '',
    animations: [
        trigger('shake', [
            ...states,
            transition('* <=> *', [
                animate(160)
            ])
        ])
    ]
})
export class TrainComponent implements OnInit, OnChanges {
    @Input() coordinates: {x: number, y: number}
    @Input() size: {width: number, height: number} = {width: 128, height: 128}
    @Input() pictureBounds: {top?: number, left?: number, width?: number, height?: number, scale?: number} = {top: 0, left: 64, width: 64, height: 64, scale: .75}
    @Input() user: {name: string, picture: string}

    _pictureBounds: {top: number, left: number, width: number, height: number}

    animState: number = 0
    keyFrames: number = _keyframes

    async ngOnInit() {
        await this.resizePicture()
    }
    async ngOnChanges() {
        await this.resizePicture()
    }

    async resizePicture() {
        let newPicSide = {
            width: (this.pictureBounds.width||this.size.width) * (this.pictureBounds.scale||1),
            height: (this.pictureBounds.height||this.size.height) * (this.pictureBounds.scale||1)
        }
        this._pictureBounds = {
            top: (this.pictureBounds.top||0) + ((this.pictureBounds.height||this.size.height) - newPicSide.height)/2,
            left: (this.pictureBounds.left||0) + ((this.pictureBounds.height||this.size.width) - newPicSide.width)/2,
            width: newPicSide.width,
            height: newPicSide.height
        }
    }
}