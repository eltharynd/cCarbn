import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'
import { _alert } from 'src/app/dashboard/twitch/alerts/alerts.component'
import { DataService } from 'src/app/shared/data.service'

@Injectable({
  providedIn: 'root'
})
export class AlertsService {

  alerts: _alert[] = []
  private elementsQueue: any[] = []
  elementsSubject: Subject<any> = new Subject()

  constructor(private data: DataService) { 

    this.elementsSubject.subscribe(element => {
      switch (element.what) {
        case 'ended':
          this.playing--
          setTimeout(async () => {
            await this.playNext()
          }, 500);
      }
    }) 

    this.data.userId.subscribe(async user => {
      this.alerts = await this.data.get(`alerts/${user}`)
    })

    this.data.socketIO.on('alertsUpdated', data => {
      this.alerts = data.alerts
    })
    
    this.data.socketIO.on('alerts', async data => {
      console.info('alert received', data)

      let user = data.user_name||null

      for(let alert of this.alerts) {

        let ignore = false
        for(let c of alert.conditions) {
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
            } else ignore = true
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
            ignore = (data.type !== 'Redemption Add') || (c.compared.id !== data.reward.id)
          } else if(c.type === 'follow') {
            ignore = data.type !== 'Follow'
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
            }
          } else if(c.type === 'raid') {
            ignore = (c.operator === 'received' && data.type !== 'Raid from') ||
                      (c.operator === 'launched' && data.type !== 'Raid to')
          } else if(c.type === 'ban') {
            ignore = (c.operator === 'banned' && (data.type !== 'Ban' || !data.is_permanent)) ||
                      (c.operator === 'timeout' && (data.type !== 'Ban' || data.is_permanent)) ||
                      (c.operator === 'unbanned' && data.type !== 'Unban')
          }

          if(ignore) break
        }

        if(ignore) continue

        if(alert.elements?.length>0) 
          alert.elements[0].withPrevious = false
        else continue

        for(let element of alert.elements) {
          if(element.type==='tts') {
            switch (element.message) {
              case 'subMessage':
                element.text = null
                break
              case 'cheerMessage':
                element.text = data.message
                break
              case 'redemptionMessage':
              default:
                element.text = data.user_input
                break
            }
          }
          if(element.text) {
            element.text = this.populateText(element.text, data)
          }
          await this.queueUp(element)
        }

      }
    })

    this.data.socketIO.on('test', async data => {
      let elements: any = []
      if(data.elements) {
        elements = data.elements
      } else {
        elements.push(data)
      }
      for(let e of elements) {
        let buffer = Object.assign({
          text: `This is a test message for a ${data.type} type element.`,
          user_name: 'JeffBezos',
          user_login: 'jeffbezos',
          bits: (Math.floor(Math.random()*10)+1)*100,
          gifted: Math.floor(Math.random()*50)+1,
          cumulative: Math.floor(Math.random()*60)+1,
          tier: Math.floor(Math.random()*3)+1,
          raider: 'Pokimane',
          raider_id: 'pokimane',
          raiders: Math.floor(Math.random()*300)+1,
          raid: 'PewDiePie',
          raid_id: 'pewdiepie',
          is_gift: 'true'
        }, e)
        if(buffer.type === 'tts') 
          buffer.text = `Hello! I'm a robot reading some text!`
        
        if(buffer.text)
          buffer.text = this.populateText(buffer.text, buffer)
          
        await this.queueUp(buffer)
      }
    })

  }

  async queueUp(element) {
    this.elementsQueue.push(element)
    await this.playNext()
  } 
  
  currentlyPlaying
  private playing = 0
  private async playNext() {
    if(this.elementsQueue.length<1 || (this.playing>0 && !this.elementsQueue[0].withPrevious))
      return
    this.playing++
    let buffer = this.elementsQueue.splice(0, 1)[0]

    this.currentlyPlaying = Object.assign(buffer, { what: 'start' })
    this.elementsSubject.next(this.currentlyPlaying)

    if(this.elementsQueue.length>0 && this.elementsQueue[0].withPrevious)
      return this.playNext()
    else 
      return true
  } 

  private populateText(text: string, element: any) {
    return text
      .replace(/\$user_id/g, element.is_anonymous ? 'Anonymous' : element.last_contribution ? element.last_contribution.user_login :  element.user_login)
      .replace(/\$user/g, element.is_anonymous ? 'Anonymous' : element.last_contribution ? element.last_contribution.user_name :  element.user_name)

      .replace(/\$bits/g, element.bits)

      .replace(/\$gifted/g, element.total)
      .replace(/\$cumulative/g, element.cumulative_total)
      .replace(/\$tier/g, element.tier)
      .replace(/\$is_gift/g, element.is_gift ? 'true' : 'false')

      .replace(/\$raider/g, element.from_broadcaster_user_name)
      .replace(/\$raider_id/g, element.from_broadcaster_user_login)
      .replace(/\$raiders/g, element.viewers)

      .replace(/\$raid/g, element.to_broadcaster_user_name)
      .replace(/\$raid_id/g, element.to_broadcaster_user_login)


      .replace(/\$ban_by/g, element.moderator_user_name)
      .replace(/\$ban_by_id/g, element.moderator_user_login)
      .replace(/\$reason/g, element.reason ? element.reason : 'Not specified.')
      .replace(/\$duration/g, element.left > 60*1000 ? 
                                `${Math.floor(element.left/600)/100} minutes` :
                                element.left > 0 ?
                                  `${Math.floor(element.left/10)/100} seconds` :
                                  ''

      )

  }

}


export enum ELEMENT_TYPES {
  video = 'Video',
  audio = 'Audio',
  tts = 'TTS',
  obs = 'OBS',
  chat = 'Chat Message',
  gif = 'GIF',
  image = 'Image',
}