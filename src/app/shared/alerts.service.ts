import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { _alert } from 'src/app/dashboard/twitch/alerts/alerts.component'
import { DataService } from 'src/app/shared/data.service'

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  alerts: _alert[] = []
  private elementsQueue: any[] = []
  elementsSubject: Subject<any> = new Subject()

  constructor(private data: DataService) {
    this.elementsSubject.subscribe(async (element) => {
      switch (element.what) {
        case 'ended':
          this.playing--
          //setTimeout(async () => {
          await this.playNext()
        //}, 500);
      }
    })

    this.data.userId.subscribe(async (user) => {
      this.alerts = await this.data.get(`alerts/${user}`)
    })

    this.data.socketIO.on('alerts-updated', (data) => {
      this.alerts = data.alerts
    })

    this.data.socketIO.on('alerts', async (data) => {
      let user = data.user_name || null

      for (let alert of this.alerts) {
        if (!alert.enabled) continue

        let ignore = false
        for (let c of alert.conditions) {
          if (c.type === 'bits') {
            if (data.type === 'Cheer') {
              let howMuch = 0
              try {
                howMuch = parseInt(c.compared)
              } catch (e) {
                ignore = true
                continue
              }
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
          } else if (c.type === 'redeem') {
            ignore = data.type !== 'Redemption Add' || c.compared.id !== data.reward.id
          } else if (c.type === 'follow') {
            ignore = data.type !== 'Follow'
          } else if (c.type === 'subscription') {
            switch (c.operator) {
              case 'sub':
                if (data.type !== 'Subscription') {
                  ignore = true
                  break
                }
                if ((c.compared === 'real' && data.is_gift) || (c.compared === 'gifted' && !data.is_gift)) {
                  ignore = true
                  break
                }
                if (c.tier && c.tier !== 'all') {
                  if (c.tier === 'one' && +data.tier !== 1000) {
                    ignore = true
                    break
                  }
                  if (c.tier === 'one' && +data.tier !== 2000) {
                    ignore = true
                    break
                  }
                  if (c.tier === 'one' && +data.tier !== 3000) {
                    ignore = true
                    break
                  }
                }
                break
              case 'subEnd':
                if (data.type !== 'Subscription End') {
                  ignore = true
                  break
                }
                if ((c.compared === 'real' && data.is_gift) || (c.compared === 'gifted' && !data.is_gift)) {
                  ignore = true
                  break
                }
                if (c.tier && c.tier !== 'all') {
                  if (c.tier === 'one' && +data.tier !== 1000) {
                    ignore = true
                    break
                  }
                  if (c.tier === 'one' && +data.tier !== 2000) {
                    ignore = true
                    break
                  }
                  if (c.tier === 'one' && +data.tier !== 3000) {
                    ignore = true
                    break
                  }
                }
                break
              case 'gift':
                if (data.type !== 'Subscription Gift') {
                  ignore = true
                  break
                }
                if (c.tier && c.tier !== 'all') {
                  if (c.tier === 'one' && +data.tier !== 1000) {
                    ignore = true
                    break
                  }
                  if (c.tier === 'one' && +data.tier !== 2000) {
                    ignore = true
                    break
                  }
                  if (c.tier === 'one' && +data.tier !== 3000) {
                    ignore = true
                    break
                  }
                }
                break
              case 'subMessage':
                if (data.type !== 'Subscription Message') {
                  ignore = true
                  break
                }
                if (c.tier && c.tier !== 'all') {
                  if (c.tier === 'one' && +data.tier !== 1000) {
                    ignore = true
                    break
                  }
                  if (c.tier === 'one' && +data.tier !== 2000) {
                    ignore = true
                    break
                  }
                  if (c.tier === 'one' && +data.tier !== 3000) {
                    ignore = true
                    break
                  }
                }
                break
              default:
                ignore = true
            }
          } else if (c.type === 'raid') {
            ignore = (c.operator === 'received' && data.type !== 'Raid from') || (c.operator === 'launched' && data.type !== 'Raid to')
          } else if (c.type === 'command') {
            ignore = data.type !== 'Command' || c.compared?.command !== data.command
          } else if (c.type === 'pollStarted') {
            ignore = data.type !== 'Poll Begin'
          } else if (c.type === 'pollProgress') {
            ignore = data.type !== 'Poll Progress'
          } else if (c.type === 'pollEnd') {
            ignore = data.type !== 'Poll End'
          } else if (c.type === 'predicitonStart') {
            ignore = data.type !== 'Prediction Begin'
          } else if (c.type === 'predicitonProgress') {
            ignore = data.type !== 'Prediction Progress'
          } else if (c.type === 'predicitonLocked') {
            ignore = data.type !== 'Prediction Lock'
          } else if (c.type === 'predicitonEnd') {
            ignore = data.type !== 'Prediction End'
          } else if (c.type === 'streamOnline') {
            ignore = data.type !== 'Online'
          } else if (c.type === 'streamOffline') {
            ignore = data.type !== 'Offline'
          } else if (c.type === 'moderatorAdded') {
            ignore = data.type !== 'Moderator Add'
          } else if (c.type === 'moderatorRemoved') {
            ignore = data.type !== 'Moderator Remove'
          } else if (c.type === 'rewardAdded') {
            ignore = data.type !== 'Reward Add'
          } else if (c.type === 'rewardUpdate') {
            ignore = data.type !== 'Reward Update'
          } else if (c.type === 'rewardDelete') {
            ignore = data.type !== 'Reward Remove'
          } else if (c.type === 'update') {
            ignore = data.type !== 'Update'
            console.log('here')
            if (c.operator && c.operator !== 'any') {
              if (/^title/gi.test(c.operator)) {
                let contains = new RegExp(c.compared || '', 'gi').test(data.title)
                if (/DoesntContain$/.test(c.operator)) ignore = contains
                else ignore = !contains
              } else if (/^category/gi.test(c.operator)) {
                let contains = new RegExp(c.compared || '', 'gi').test(data.category_name)
                if (/DoesntContain$/.test(c.operator)) ignore = contains
                else ignore = !contains
              }
            }
          } else if (c.type === 'ban') {
            ignore =
              (c.operator === 'banned' && (data.type !== 'Ban' || !data.is_permanent)) ||
              (c.operator === 'timeout' && (data.type !== 'Ban' || data.is_permanent)) ||
              (c.operator === 'unbanned' && data.type !== 'Unban')
          } else if (c.type === 'user') {
            switch (c.operator) {
              case 'is':
                ignore = `${c.compared}`.toLowerCase().replace(/\s/g, '') !== `${user}`.toLowerCase()
                break
              case 'isnt':
                ignore = `${c.compared}`.toLowerCase().replace(/\s/g, '') === `${user}`.toLowerCase()
                break
              case 'typeis':
                break
              case 'typeisnt':
                break
              default:
                ignore = true
            }
            continue
          } else {
            ignore = true
          }

          if (ignore) break
        }

        if (ignore) continue

        if (alert.elements?.length > 0) alert.elements[0].withPrevious = false
        else continue

        for (let element of alert.elements) {
          if (element.type === 'tts') {
            switch (element.message) {
              case 'customMessage':
                if (element.text) element.text = this.populateText(element.text, data)
                break
              case 'subMessage':
                element.text = data.message?.text ? data.message.text : data.message
                break
              case 'cheerMessage':
                element.text = data.message
                break
              case 'redemptionMessage':
              default:
                element.text = data.user_input
                break
            }
          } else if (element.type === 'clip') {
            element.alertData = data.alertData
          }
          if (element.text) {
            element.text = this.populateText(element.text, data)
          }
          await this.queueUp(element)
        }
      }
    })

    this.data.socketIO.on('alerts-test', async (data) => {
      let elements: any = []
      if (data.elements) {
        elements = data.elements
      } else {
        elements.push(data)
      }
      for (let e of elements) {
        let buffer = Object.assign(
          {
            text: `This is a test message for a ${data.type} type element.`,
            user_name: 'JeffBezos',
            user_login: 'jeffbezos',
            bits: (Math.floor(Math.random() * 10) + 1) * 100,
            gifted: Math.floor(Math.random() * 50) + 1,
            cumulative: Math.floor(Math.random() * 60) + 1,
            tier: (Math.floor(Math.random() * 3) + 1) * 1000,
            from_broadcaster_user_name: 'eltharynd',
            from_broadcaster_user_login: 'eltharynd',
            viewers: Math.floor(Math.random() * 300) + 1,
            to_broadcaster_user_name: 'eltharynd',
            to_broadcaster_user_login: 'eltharynd',
            is_gift: 'true',
          },
          e
        )
        if (buffer.type === 'tts') buffer.text = buffer.customMessage || `Hello! I'm a robot reading some text!`

        if (buffer.text) buffer.text = this.populateText(buffer.text, buffer)

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
    if (this.elementsQueue.length < 1 || (this.playing > 0 && !this.elementsQueue[0].withPrevious)) return
    this.playing++
    let buffer = this.elementsQueue.splice(0, 1)[0]

    this.currentlyPlaying = Object.assign(buffer, { what: 'start' })
    this.elementsSubject.next(this.currentlyPlaying)

    if (this.elementsQueue.length > 0 && this.elementsQueue[0].withPrevious) return this.playNext()
    else return true
  }

  private populateText(text: string, element: any) {
    return text
      .replace(/\$user_id/g, element.is_anonymous ? 'Anonymous' : element.last_contribution ? element.last_contribution.user_login : element.user_login)
      .replace(/\$user/g, element.is_anonymous ? 'Anonymous' : element.last_contribution ? element.last_contribution.user_name : element.user_name)

      .replace(/\$bits/g, element.bits)

      .replace(/\$gifted/g, element.total)
      .replace(/\$cumulative/g, element.cumulative_total)
      .replace(/\$tier/g, `${+element.tier / 1000}`)
      .replace(/\$is_gift/g, element.is_gift ? 'true' : 'false')

      .replace(/\$raiders/g, element.viewers)
      .replace(/\$raider_id/g, element.from_broadcaster_user_login)
      .replace(/\$raider/g, element.from_broadcaster_user_name)

      .replace(/\$raid_id/g, element.to_broadcaster_user_login)
      .replace(/\$raid/g, element.to_broadcaster_user_name)

      .replace(/\$ban_by_id/g, element.moderator_user_login)
      .replace(/\$ban_by/g, element.moderator_user_name)

      .replace(/\$reason/g, element.reason ? element.reason : 'Not specified.')
      .replace(
        /\$duration/g,
        element.left > 60 * 1000 ? `${Math.floor(element.left / 600) / 100} minutes` : element.left > 0 ? `${Math.floor(element.left / 10) / 100} seconds` : ''
      )
  }
}

export enum ELEMENT_TYPES {
  video = 'Video',
  audio = 'Audio',
  gif = 'GIF',
  image = 'Image',
  tts = 'TTS',
  chat = 'Chat Message',
  obs = 'OBS',
  clip = 'Clip',
}
