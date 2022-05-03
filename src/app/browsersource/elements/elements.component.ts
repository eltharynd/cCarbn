import { animate, animateChild, style, transition, trigger } from '@angular/animations'
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs'
import { OBSService } from 'src/app/shared/obs.service'
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
  BOTTOM_RIGHT = 'BOTTOM_RIGHT'
}

export enum TRANSITION {
  NONE = 'None',
  FADE = 'Fade',
  POP_UP = 'Pop upwards',
  POP_DOWN = 'Pop downwards',
  UNPOP_UP = 'Unpop upwards',
  UNPOP_DOWN = 'Unpop downwards',
  SWIPE_LEFT = 'Swipe left',
  SWIPE_RIGHT = 'Swipe right',
}

export const ELEMENT_ANIMATIONS = [
  trigger('in', [


    transition(`void => FADE`, [
      style({opacity: 0}),
      animate('500ms ease', style({}))
    ]),
   
    transition(`void => POP_UP`, [
      style({opacity: 0, transform: 'translateX(-10px) translateY(30px)'}),
      animate('500ms ease', style({}))
    ]),
    transition(`void => POP_DOWN`, [
      style({opacity: 0, transform: 'translateX(-10px) translateY(-30px)'}),
      animate('500ms ease', style({}))
    ]),

    transition(`void => UNPOP_UP`, [
      style({opacity: 0, transform: 'translateX(10px) translateY(30px)'}),
      animate('500ms ease', style({}))
    ]),

    transition(`void => UNPOP_DOWN`, [
      style({opacity: 0, transform: 'translateX(10px) translateY(-30px)'}),
      animate('500ms ease', style({}))
    ]),

    transition(`void => SWIPE_RIGHT`, [
      style({opacity: 0, transform: 'rotate(90deg) translateX(-2000px)'}),
      animate('500ms ease', style({}))
    ]),
    transition(`void => SWIPE_LEFT`, [
      style({opacity: 0, transform: 'rotate(-90deg) translateX(2000px)'}),
      animate('500ms ease', style({}))
    ]),


  ]),
  trigger('out', [


    transition('FADE => void', [
      style({}),
      animate('500ms ease', style({opacity: 0})),
    ]),

    transition('POP_DOWN => void', [
      style({}),
      animate('500ms ease', style({opacity: 0, transform: 'translateX(10px) translateY(30px)'})),
    ]),
    transition('POP_UP => void', [
      style({}),
      animate('500ms ease', style({opacity: 0, transform: 'translateX(10px) translateY(-30px)'})),
    ]),

    transition('UNPOP_UP => void', [
      style({}),
      animate('500ms ease', style({opacity: 0, transform: 'translateX(-10px) translateY(-30px)'})),
    ]),

    transition('UNPOP_DOWN => void', [
      style({}),
      animate('500ms ease', style({opacity: 0, transform: 'translateX(-10px) translateY(30px)'})),
    ]),

    transition('SWIPE_LEFT => void', [
      style({}),
      animate('500ms ease', style({opacity: 0, transform: 'rotate(90deg) translateX(-2000px)'})),
    ]),
    transition('SWIPE_RIGHT => void', [
      style({}),
      animate('500ms ease', style({opacity: 0, transform: 'rotate(-90deg) translateX(2000px)'})),
    ]),


  ])
]

@Component({
  selector: 'app-elements',
  templateUrl: './elements.component.html',
  animations: ELEMENT_ANIMATIONS
})
export class AlertsComponent implements OnInit {


  viewport = {
    width: 1920,
    height: 1080,
    padding: 50
  }

  currentElements: any[] = []
  cantPlay = false
  
  constructor(private alerts: AlertsService, public OBS: OBSService) {
    alerts.elementsSubject.subscribe(element => {
      switch (element.what) {
        case 'start':
          this.currentElements.push(element)
          break
        case 'ended': 
          this.currentElements.splice(this.currentElements.indexOf(element), 1)
          break
      }
    })
  }

  async ngOnInit() {
    if(!this.OBS.isOBS) {
      let audio = new Audio()
      audio.play().catch(e => {
        this.cantPlay = true
        window.onclick = (click) => {
          this.cantPlay = false
          window.onclick = null
        }
      })
    }
  }
}