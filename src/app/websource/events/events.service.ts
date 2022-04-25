import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { Subject } from 'rxjs'
import { AuthGuard } from 'src/app/auth/auth.guard'
import { _element } from 'src/app/dashboard/twitch/api/api.component'
import { DataService, SERVER_URL } from 'src/app/shared/data.service'

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  elements: _element[] = []
  private eventsQueue: any[] = []
  eventsSubject: Subject<any> = new Subject()


  constructor(private data: DataService) { 

    this.eventsSubject.subscribe(event => {
      switch (event.what) {
        case 'ended':
          this.playing--
          setTimeout(async () => {
            await this.playNext()
          }, 500);
      }
    }) 

    this.data.userId.subscribe(async user => {
      this.elements = await this.data.get(`elements/${user}`)
    })

    this.data.socketIO.on('events', async data => {
      console.info('event received', data)

      let user = data.user_name||null

      for(let element of this.elements) {

        let ignore = false
        for(let c of element.conditions) {
          //console.log(c)
          if(c.type === 'bit') {
            if(data.eventType !== 'cheer') {
              let howMuch = 0
              try { howMuch = parseInt(c.compared) } catch(e) { ignore = true; continue; }
              switch (c.operator) {
                case 'lesser':
                  ignore = +data.bits >= +howMuch
                  break
                case 'lesserEqual':
                  ignore = +data.bits > +howMuch
                  break
                case 'greater':
                  ignore = +data.bits <= +howMuch
                  break
                case 'greaterEqual':
                  ignore = +data.bits < +howMuch
                  break
                case 'equals':
                  ignore = +data.bits !== +howMuch
                  break
              }
              continue
            }
          } else if(c.type === 'user') {
            switch (c.operator) {
              case 'is':
                ignore = `${c.compared}`.toLowerCase().replace(/\s/g, '') !== `${user}`.toLowerCase()
                break
              case 'isnt':
                ignore = `${c.compared}`.toLowerCase().replace(/\s/g, '') === `${user}`.toLowerCase()
                break
              default:
                ignore = true
            }
            continue
          } else if(c.type === 'redeem') {
            //TODO implement
            if(data.eventType !== 'redeem') {
              ignore = true
              continue
            }
            ignore = c.compared.id !== data.reward.id
          }
        }

        if(ignore) continue

        for(let event of element.events) {
          if(event.type==='tts') {
            switch (event.message) {
              case 'subMessage':
                event.text = null
                break
              case 'cheerMessage':
                event.text = data.message
                break
              case 'redemptionMessage':
              default:
                event.text = data.user_input
                break
            }
          }
          await this.queueUp(event)
        }

      }
    })

    this.data.socketIO.on('test', async data => {
      await this.queueUp(data)
    })

  }


  async queueUp(event) {
    this.eventsQueue.push(event)
    await this.playNext()
  } 
  
  private playing = 0
  private async playNext() {
    if(this.eventsQueue.length<1 || (this.playing>0 && !this.eventsQueue[0].withPrevious))
      return
    this.playing++
    let buffer = this.eventsQueue.splice(0, 1)[0]
    this.eventsSubject.next(Object.assign(buffer, { what: 'start' }))

    if(this.eventsQueue.length>0 && this.eventsQueue[0].withPrevious)
      return this.playNext()
    else 
      return true
  } 
}

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

export enum EVENT_TYPES {
  video = 'Video',
  audio = 'Audio',
  tts = 'TTS',
/*   gif = 'GIF',
  message = 'Chat Message' */
}