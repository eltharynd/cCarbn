import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'
import { _element } from 'src/app/dashboard/twitch/elements/elements.component'
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

    this.data.socketIO.on('elementsUpdated', data => {
      this.elements = data.elements
    })
    
    this.data.socketIO.on('events', async data => {
      console.info('event received', data)

      let user = data.user_name||null

      for(let element of this.elements) {

        let ignore = false
        for(let c of element.conditions) {
          if(c.type === 'bit') {
            if(data.type === 'Cheer') {
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
            } else {
              ignore = true
              break
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
            if(data.type !== 'Redemption Add') {
              ignore = true
              break
            }
            ignore = c.compared.id !== data.reward.id
          } else if(c.type === 'follow') {
            if(data.type !== 'Follow') {
              ignore = true
              break
            }
          } else if(c.type === 'subscription') {
            switch (c.operator) {
              case 'sub':
                if(data.type !== 'Subscription') {
                  ignore = true
                  break
                }
                if(c.operator === 'sub')
                  ignore = (c.compared === 'real' && data.is_gift) ||
                            (c.compared === 'gifted' && !data.is_gift)
                break
              case 'subEnd':
                if(data.type !== 'Subscription End') ignore = true
                break
              case 'gift':
                if(data.type !== 'Subscription Gift') ignore = true
                break
              case 'subMessage':
                if(data.type !== 'Subscription Message') ignore = true
                break
              default:
                ignore = true
                break
            }
            if(ignore) break
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
          if(event.text) {
            event.text = this.populateText(event.text, data)
          }
          await this.queueUp(event)
        }

      }
    })

    this.data.socketIO.on('test', async data => {
      let buffer = Object.assign({
        text: `This is a test message for a ${data.type} type event.`,
        user_name: 'JeffBezos',
        user_login: 'jeffbezos',
        bits: '1000',
      }, data)
      if(buffer.type === 'tts') 
        buffer.text = 'This is a test TTS! I hope you enjoy it!'
      
      if(buffer.text)
        buffer.text = this.populateText(buffer.text, buffer)
        
      await this.queueUp(buffer)
    })

  }

  async distributeEvents(data) {
    
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

  private populateText(text: string, event: any) {
    return text
      .replace(/\$user_id/g, event.last_contribution ? event.last_contribution.user_login :  event.user_login)
      .replace(/\$user/g, event.last_contribution ? event.last_contribution.user_name :  event.user_name)

      .replace(/\$bits/g, event.bits)

      .replace(/\$tier/g, event.tier)
      .replace(/\$is_gift/g, event.is_gift ? 'true' : 'false')
  }

}


export enum EVENT_TYPES {
  video = 'Video',
  audio = 'Audio',
  tts = 'TTS',
  obs = 'OBS',
  chat = 'Chat Message'
  //gif = 'GIF',
}