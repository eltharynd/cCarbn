import { OnInit, Component, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core'
import { AuthGuard } from '../../../auth/auth.guard'
import { DataService, SERVER_URL } from 'src/app/shared/data.service'
import { ELEMENT_TYPES } from 'src/app/shared/alerts.service'
import { filter, from, map, Subject, toArray } from 'rxjs'
import { environment } from 'src/environments/environment'
import { OBSService } from 'src/app/shared/obs.service'
import { BORDER, POSITION, TRANSITION } from 'src/app/browsersource/elements/elements.component'
import { KeyValue } from '@angular/common'
import { SettingsService } from 'src/app/shared/settings.service'
@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsComponent implements OnInit, OnDestroy {
  alerts: _alert[]
  channelRewards: _redemption[] = []
  uploadedSubject: Subject<any> = new Subject()

  constructor(private data: DataService, public auth: AuthGuard, public OBS: OBSService, public cdr: ChangeDetectorRef, public settings: SettingsService) {
    this.data.get(`user/${this.auth.currentUser?._id}/redemptions`).then((data) => {
      this.channelRewards = data.sort((a, b) => a.title.localeCompare(b.title))
      this.cdr.detectChanges()
    })
    this.uploadedSubject.subscribe((data) => {
      this.mediaUploaded(data.reference.al, data.reference.ev, data.url.url)
    })
  }

  async ngOnInit() {
    document.documentElement.classList.remove('smooth-scrolling')
    this.alerts = await this.data.get(`alerts/${this.auth.currentUser?._id}`)
    this.cdr.detectChanges()
    for (let al of this.alerts) {
      al.backup = JSON.stringify(al)
    }

    this.data.send('requestOBSlist', {
      userId: this.auth.currentUser?._id,
    })

    this.getUserCommands()
  }

  async ngOnDestroy() {
    document.documentElement.classList.add('smooth-scrolling')
  }

  sendTestAlert(pointerEvent, alert) {
    pointerEvent.stopPropagation()
    for (let element of alert.elements) {
      this.data.send('alerts-test', Object.assign({ userId: this.auth.currentUser?._id }, element))
    }
  }

  async toggleEnabled(alert) {
    let response = await this.data.patch(`alerts/${this.auth.currentUser?._id}`, cleanAlert(alert))
    if (response) {
      alert._id = response
      this.data.send('alerts-updated', {
        userId: this.auth.currentUser?._id,
        alerts: this.alerts,
      })
    } else {
      alert.enabled = !alert.enabled
    }
    this.cdr.detectChanges()
  }

  async addAlert() {
    let alert: any = {
      name: 'An alert',
      enabled: true,
      conditions: [
        {
          type: null,
          operator: null,
          compared: null,
        },
      ],
      elements: [{ placeholder: true, selectThis: true }],
      expanded: true,
    }
    alert.backup = JSON.stringify(alert)
    this.alerts.push(alert)
    this.cdr.detectChanges()
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 100)
    await this.saveAlert(alert)
  }

  revertAlert(alert: _alert) {
    alert.error = false
    let backup = JSON.parse(alert.backup)
    for (let key of Object.keys(alert)) {
      if (backup.hasOwnProperty(key)) {
        alert[key] = backup[key]
      } else {
        delete alert[key]
      }
    }
    this.cdr.detectChanges()
  }
  async saveAlert(alert: _alert) {
    alert.error = false

    if (alert.elements.length > 0) {
      delete alert.elements[0].withPrevious
    }

    let clone = cleanAlert(alert)
    let response = await this.data.post(`alerts/${this.auth.currentUser?._id}`, clone)
    if (response) {
      alert._id = response
      alert.changes = false
      delete alert.backup
      alert.backup = JSON.stringify(alert)
      this.data.send('alerts-updated', {
        userId: this.auth.currentUser?._id,
        alerts: this.alerts,
      })
      this.cdr.detectChanges()
      return alert._id
    } else {
      alert.error = true
      this.cdr.detectChanges()
      setTimeout(() => {
        alert.error = false
        this.cdr.detectChanges()
      }, 3000)
      return false
    }
  }
  async deleteAlert(alert: _alert) {
    if (alert._id)
      if (!(await this.data.delete(`alerts/${this.auth.currentUser?._id}/${alert._id}`))) {
        alert.error = true
        this.cdr.detectChanges()
        setTimeout(() => {
          alert.error = false
          this.cdr.detectChanges()
        }, 3000)
        return false
      }

    let index = this.alerts.indexOf(alert)
    if (index >= 0) {
      this.alerts.splice(index, 1)
      this.cdr.detectChanges()
    }
    this.data.send('alerts-updated', {
      userId: this.auth.currentUser?._id,
      alerts: this.alerts,
    })
    return true
  }
  async moveAlert(alert: _alert, upwards: boolean) {
    if (!alert._id) await this.saveAlert(alert)
    let index = this.alerts.indexOf(alert)
    if (index < 0) return

    if (await this.data.get(`alerts/${this.auth.currentUser?._id}/move/${upwards ? 'upwards' : 'downwards'}/${index}`)) {
      this.alerts.splice(index + (upwards ? -1 : 1), 0, this.alerts.splice(index, 1)[0])
      this.cdr.detectChanges()
    }
  }

  addCondition(alert: _alert) {
    alert.conditions.push({
      type: null,
      operator: null,
      compared: null,
    })
    alert.changes = true
    this.cdr.detectChanges()
  }
  deleteCondition(alert: _alert, condition) {
    alert.conditions.splice(alert.conditions.indexOf(condition), 1)
    alert.changes = true
    this.cdr.detectChanges()
  }

  selectedElementType
  addElement(alert: _alert, type) {
    if (alert.elements.length > 0) delete alert.elements[0].withPrevious
    for (let e of alert.elements) delete e.selectThis
    alert.elements.push({
      type: type,
      selectThis: true,
    })
    alert.manualSelect = true

    this.selectedElementType = null
    alert.changes = true
    if (alert.elements[0].placeholder) alert.elements.splice(0, 1)
    this.cdr.detectChanges()
  }
  deleteElement(alert: _alert, index) {
    alert.elements.splice(index, 1)
    if (alert.elements.length > 0) delete alert.elements[0].withPrevious

    delete alert.manualSelect

    this.selectedElementType = null
    alert.changes = true
    if (alert.elements.length < 1) alert.elements.push({ placeholder: true, selectThis: true })
    this.cdr.detectChanges()
  }
  async moveElement(alert: _alert, element, right: boolean) {
    let index = alert.elements.indexOf(element)
    if (index < 0) return

    alert.elements.splice(index + (right ? 1 : -1), 0, alert.elements.splice(index, 1)[0])
    if (alert.elements[0].withPrevious) delete alert.elements[0].withPrevious
    alert.changes = true
    this.cdr.detectChanges()
  }

  userVideos
  userAudios
  userGIFS
  userImages
  async getUserSelectableFiles(element) {
    let files = await this.data.get(`user/${this.auth.currentUser?._id}/uploads`)

    this.userVideos = await from(files)
      .pipe(
        filter((u: any) => /^video/i.test(u.contentType)),
        map((u: any) => {
          return Object.assign(u, {
            src: `${SERVER_URL}uploads/${this.auth.currentUser?._id}/${encodeURI(u.filename)}`,
          })
        }),
        toArray()
      )
      .toPromise()

    this.userAudios = await from(files)
      .pipe(
        filter((u: any) => /^audio/i.test(u.contentType)),
        map((u: any) => {
          return Object.assign(u, {
            src: `${SERVER_URL}uploads/${this.auth.currentUser?._id}/${encodeURI(u.filename)}`,
          })
        }),
        toArray()
      )
      .toPromise()

    this.userGIFS = await from(files)
      .pipe(
        filter((u: any) => /^image\/gif/i.test(u.contentType)),
        map((u: any) => {
          return Object.assign(u, {
            src: `${SERVER_URL}uploads/${this.auth.currentUser?._id}/${encodeURI(u.filename)}`,
          })
        }),
        toArray()
      )
      .toPromise()

    this.userImages = await from(files)
      .pipe(
        filter((u: any) => /^image/i.test(u.contentType) && !/^image\/gif/i.test(u.contentType)),
        map((u: any) => {
          return Object.assign(u, {
            src: `${SERVER_URL}uploads/${this.auth.currentUser?._id}/${encodeURI(u.filename)}`,
          })
        }),
        toArray()
      )
      .toPromise()

    element.select = true
    element.upload = false
    this.cdr.detectChanges()
  }

  userCommands = {}
  async getUserCommands() {
    let response = await this.data.get(`user/${this.auth.currentUser?._id}/commands/alertable`)
    if (response) {
      let buffer = {}
      for (let c of response) {
        buffer[c._id] = c
      }
      this.userCommands = buffer
    }
    this.cdr.detectChanges()
  }

  async videoSelected(alert: _alert, element) {
    let fileName = element.src.replace(SERVER_URL, '').replace(/^.+\//g, '')
    if (!(await this.data.get(`uploads/${this.auth.currentUser?._id}/link/${fileName}`))) {
      element.src = null
      this.cdr.detectChanges()
      return
    }
    if (!(await this.saveAlert(alert))) {
      await this.data.get(`uploads/${this.auth.currentUser?._id}/unlink/${fileName}`)
      element.src = null
      this.cdr.detectChanges()
    }
  }
  async deleteMediaSource(alert: _alert, element, src) {
    let filePath = src.replace(SERVER_URL, '')

    this.data
      .delete(filePath)
      .then(async () => {
        element.src = null
        await this.saveAlert(alert)
      })
      .catch(async (e) => {
        if (e.response.status === 404) {
          element.src = null
          await this.saveAlert(alert)
        }
      })
  }
  async mediaUploaded(alert: _alert, element, url) {
    element.src = `${SERVER_URL}${url}`
    element.upload = false
    let fileName = element.src.replace(/^.+\//g, '')

    if (alert.name === 'An alert') {
      alert.name = fileName
      alert.changes = true
    }

    if (!(await this.saveAlert(alert))) {
      await this.data.get(`uploads/${this.auth.currentUser?._id}/unlink/${fileName}`)
      element.src = null
      this.cdr.detectChanges()
    }
  }
  onLoadedData(element, data) {
    let file = data.srcElement
    let mediaInformation = {
      width: file.videoWidth || file.naturalWidth || null,
      height: file.videoHeight || file.naturalHeight || null,
      duration: file.duration || null,
    }
    element.mediaInformation = mediaInformation
    this.cdr.detectChanges()
  }

  ElementTypes = ELEMENT_TYPES
  _primaryConditions = {
    bits: 'Bits cheered',

    redeem: 'Channel redemption',

    follow: 'Follow',
    subscription: 'Subscription',

    raid: 'Raid',
    command: 'Chat command',
    welcome: 'First message of stream',
  }
  _interactionConditions = {
    pollStarted: 'Poll started',
    pollProgress: 'Poll progress',
    pollEnd: 'Poll ended',

    predicitonStart: 'Prediction started',
    predicitonProgress: 'Prediction progress',
    predicitonLocked: 'Prediction locked',
    predicitonEnd: 'Prediction ended',
  }
  _streamConditions = {
    streamOnline: 'Stream online',
    streamOffline: 'Stream offline',

    moderatorAdded: 'Mod Added',
    moderatorRemoved: 'Mod Removed',

    rewardAdded: 'Channel reward created',
    rewardUpdate: 'Channel reward updated',
    rewardDelete: 'Channel reward deleted',

    update: 'Title/category changed',

    ban: 'Ban or Timeout',
  }
  _secondaryConditions = {
    user: 'User',
  }

  _operators = {
    comparison: {
      equals: '=',
      lesser: '<',
      lesserEqual: '<=',
      greater: '>',
      greaterEqual: '>=',
    },
    user: {
      is: 'is',
      isnt: "isn't",
    },
    userType: {
      typeis: 'type is',
      typeisnt: "type isn't",
    },
    redemption: {
      redeemed: 'redeemed',
      approved: 'approved',
      declined: 'declined',
    },
    subscription: {
      sub: 'User subscribed',
      subEnd: 'User sub ended',
      gift: 'User gifted a sub',
      subMessage: 'User announces sub/resub',
    },
    raid: {
      received: 'Raided by someone',
      launched: 'Raided someone else',
    },
    ban: {
      banned: 'User is banned',
      timeout: 'User timed out',
      unbanned: 'Ban/TO ended',
    },
    update: {
      any: 'Any change',
      titleContains: 'title contains',
      titleDoesntContain: "title doesn't contain",
      categoryContains: 'category contains',
      categoryDoesntContain: "category doesn't contain",
    },
    all: () =>
      Object.assign(
        {},
        this._operators.comparison,
        this._operators.user,
        this._operators.userType,
        this._operators.redemption,
        this._operators.subscription,
        this._operators.raid,
        this._operators.ban
      ),
  }

  _userTypes = {
    mod: 'Mod',
    streamer: 'Streamer',
    follower: 'Follower',
    sub: 'Sub',
    vip: 'VIP',
  }
  _subOptions = {
    any: 'Any',
    real: 'Only real',
    gifted: 'Only gifted',
  }
  _subTiers = {
    all: 'All Tiers',
    one: 'Tier 1',
    two: 'Tier 2',
    three: 'Tier 3',
  }

  _POSITION = POSITION
  _TRANSITION = TRANSITION
  _options = {
    video: {
      mandatory: {
        position: 'Position',
        transitionIN: 'Transition IN',
        transitionOUT: 'Transition OUT',
      },
      default: {
        position: POSITION.CENTER,
        transitionIN: TRANSITION.NONE,
        transitionOUT: TRANSITION.NONE,
      },
      additional: {
        width: 'Manual Width',
        height: 'Manual Height',
        offsetX: 'X offset',
        offsetY: 'Y offset',
      },
      units: {
        duration: 's',
        position: 'POSITION',
        transitionIN: 'TRANSITION',
        transitionOUT: 'TRANSITION',
        width: 'px',
        height: 'px',
        offsetX: 'px',
        offsetY: 'px',
      },
    },
    audio: {
      mandatory: {},
      default: {},
      additional: {},
    },
    gif: {
      mandatory: {
        duration: 'Duration',
        position: 'Position',
        transitionIN: 'Transition IN',
        transitionOUT: 'Transition OUT',
      },
      default: {
        duration: 5,
        position: POSITION.CENTER,
        transitionIN: TRANSITION.NONE,
        transitionOUT: TRANSITION.NONE,
      },
      additional: {
        width: 'Width override',
        height: 'Height override',
        offsetX: 'X offset',
        offsetY: 'Y offset',
      },
      units: {
        duration: 's',
        position: 'POSITION',
        transitionIN: 'TRANSITION',
        transitionOUT: 'TRANSITION',
        width: 'px',
        height: 'px',
        offsetX: 'px',
        offsetY: 'px',
      },
    },
    image: {
      mandatory: {
        duration: 'Duration',
        position: 'Position',
        transitionIN: 'Transition IN',
        transitionOUT: 'Transition OUT',
      },
      default: {
        duration: 5,
        position: POSITION.CENTER,
        transitionIN: TRANSITION.NONE,
        transitionOUT: TRANSITION.NONE,
      },
      additional: {
        width: 'Width override',
        height: 'Height override',
        offsetX: 'X offset',
        offsetY: 'Y offset',
      },
      units: {
        duration: 's',
        position: 'POSITION',
        transitionIN: TRANSITION.NONE,
        transitionOUT: TRANSITION.NONE,
        width: 'px',
        height: 'px',
        offsetX: 'px',
        offsetY: 'px',
      },
    },
    clip: {
      mandatory: {
        position: 'Position',
        transitionIN: 'Transition IN',
        transitionOUT: 'Transition OUT',
        playerScale: 'Player scale',
      },
      default: {
        position: POSITION.CENTER,
        transitionIN: TRANSITION.NONE,
        transitionOUT: TRANSITION.NONE,
        playerScale: 100,
      },
      additional: {
        delay: 'Delay execution',
      },
      units: {
        position: 'POSITION',
        transitionIN: 'TRANSITION',
        transitionOUT: 'TRANSITION',
        playerScale: '%',
        delay: 's',
      },
    },
  }

  _tts = {
    options: {
      customMessage: 'Custom Message',
      redemptionMessage: 'Redemption message',
      cheerMessage: 'Cheer message',
      subMessage: 'Sub message',
    },
    voices: {
      'en-au': 'Australian english',
      'en-uk': 'British english',
      'en-us': 'American english',
    },
    supporterVoices: {
      'google_en-US-Standard-A': 'Google - Masculine A',
      'google_en-US-Standard-B': 'Google - Masculine B',
      'google_en-US-Standard-I': 'Google - Masculine I',
      'google_en-US-Standard-J': 'Google - Masculine J',
      'google_en-US-Standard-D': 'Google - Masculine D',

      'google_en-US-Standard-C': 'Google - Feminine C',
      'google_en-US-Standard-E': 'Google - Feminine E',
      'google_en-US-Standard-F': 'Google - Feminine F',
      'google_en-US-Standard-G': 'Google - Feminine G',
      'google_en-US-Standard-H': 'Google - Feminine H',

      aws_Amy: 'AWS - Amy',
      aws_Aditi: 'AWS - Aditi',
      aws_Brian: 'AWS - Brian',
      aws_Emma: 'AWS - Emma',
      aws_Ivy: 'AWS - Ivy',
      aws_Joanna: 'AWS - Joanna',
      aws_Joey: 'AWS - Joey',
      aws_Justin: 'AWS - Justin',
      aws_Kendra: 'AWS - Kendra',
      aws_Kevin: 'AWS - Kevin',
      aws_Kimberly: 'AWS - Kimberly',
      aws_Matthew: 'AWS - Matthew',
      aws_Nicole: 'AWS - Nicole',
      aws_Raveena: 'AWS - Raveena',
      aws_Russell: 'AWS - Russell',
      aws_Salli: 'AWS - Salli',
    },
    premiumVoices: {
      'google_en-US-Wavenet-A': 'Google Wavenet - Masculine A',
      'google_en-US-Wavenet-B': 'Google Wavenet - Masculine B',
      'google_en-US-Wavenet-I': 'Google Wavenet - Masculine I',
      'google_en-US-Wavenet-J': 'Google Wavenet - Masculine J',
      'google_en-US-Wavenet-D': 'Google Wavenet - Masculine D',

      'google_en-US-Wavenet-C': 'Google Wavenet - Feminine C',
      'google_en-US-Wavenet-E': 'Google Wavenet - Feminine E',
      'google_en-US-Wavenet-F': 'Google Wavenet - Feminine F',
      'google_en-US-Wavenet-G': 'Google Wavenet - Feminine G',
      'google_en-US-Wavenet-H': 'Google Wavenet - Feminine H',

      aws_neural_Amy: 'AWS Neural - Amy',
      aws_neural_Aria: 'AWS Neural - Aria',
      aws_neural_Ayanda: 'AWS Neural - Ayanda',
      aws_neural_Brian: 'AWS Neural - Brian',
      aws_neural_Emma: 'AWS Neural - Emma',
      aws_neural_Geraint: 'AWS Neural - Geraint',
      aws_neural_Ivy: 'AWS Neural - Ivy',
      aws_neural_Joanna: 'AWS Neural - Joanna',
      aws_neural_: 'AWS Neural - Joey',
      aws_neural_Joey: 'AWS Neural - Justin',
      aws_neural_Kendra: 'AWS Neural - Kendra',
      aws_neural_Kimberly: 'AWS Neural - Kimberly',
      aws_neural_Matthew: 'AWS Neural - Matthew',
      aws_neural_Olivia: 'AWS Neural - Olivia',
      aws_neural_Salli: 'AWS Neural - Salli',
    },
  }
  _obs = {
    triggers: {
      sourceVisibility: 'Source (or Group) visibility',
      filterVisibility: 'Filter visibility',
    },
  }
  _chat = {
    keywords: {
      $user: 'The display name of the user triggered the alert',
      $user_id: 'The user that triggered the alert',

      $bits: 'The amount of bits cheered',

      $tier: 'The subscription tier',
      $is_gift: 'Subscription was a gift (true/false)',
      $gifted: 'The amount of gifted subs',
      $cumulative: 'The cumulative amount of gifted subs',

      $raider: 'The display name of user that raided',
      $raider_id: 'The user that raided',
      $raiders: 'The amount of people that came with the raid',

      $raid: 'The user being raided',
      $raid_id: 'The userId being raided',

      $ban_by: 'The display name of the mod that banned/unbanned',
      $ban_by_id: 'The mod that banned/unbanned',
      $reason: 'The reason for the ban',
      $duration: 'The time left for timeout',
    },
  }
  _clip = {
    which: {
      random: 'A random recent clip from the user (or @streamer)',
      topClip: 'The top recent clip from the user (or @streamer)',
    },
  }

  _BORDER = BORDER
}

interface _condition {
  type: string
  operator: string
  compared: any
  tier?: any
}

export interface _alert {
  name: string
  conditions: _condition[]
  elements: any[]

  _id?: string
  backup?: any
  changes?: boolean
  error?: boolean
  expanded?: any
  select?: boolean
  upload?: boolean
  activeTab?: number
  enabled?: boolean
  buffer?: any

  manualSelect?: any
  selectedElementToAdd?: any
  selectedElementToDelete?: any
}

const cleanAlert = (alert: _alert) => {
  let clone = JSON.parse(JSON.stringify(alert))
  for (let el of alert.elements) {
    delete el.select
    delete el.upload
    //delete el.selectThis
  }
  delete clone.backup
  delete clone.changes
  delete clone.error
  delete clone.expanded
  delete clone.disabled
  delete clone.buffer
  //delete clone.manualSelect
  delete clone.selectedElementToAdd
  delete clone.selectedElementToDelete
  return clone
}

interface _redemption {
  id: string
  title: string
}
