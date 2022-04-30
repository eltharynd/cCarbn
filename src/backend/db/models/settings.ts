import { Schema, model } from "mongoose"
import * as merge from 'deepmerge'

const SETTINGS_TEMPLATE = {
  api: {
    enabled: false,
    listeners: {
      ban: {
        enabled: false
      },
      cheer: {
        enabled: false
      },
      follow: {
        enabled: false
      },
      hypetrain: {
        enabled: false,
        viewport: {
          width: 1280,
          height: 720,
          background: false,
          dark: false
        },
        infoText: {
          enabled: true,
          messages: {
            sub: '@user JUST SUBSCRIBED!! WHAT A LEGEND!',
            gift: '@user JUST GIFTED $x SUBS!! WHAT A LEGEND!',
            cheer: '@user JUST CHEERED $x BITS!! WHAT A LEGEND!'
          },
          delay: 500,
          position: 'bottom',
          fontSize: '4rem',
          fontWeight: 'bold',
          fontStroke: '#d6d6d6',
          fontStrokeWidth: '.1rem',
          color: '#4a4444',
          margin: '2rem'
        },
        train: {
          enabled: true,
          reverseDirection: false,
          maxRows: 2,
          reverseWrap: false,
          start: {
            x: 25, 
            y: 25
          },
          locomotive: {
            pictures: {
              background: null,
              foreground: null
            },
            size: {
              width: 128, 
              height: 128,
            },
            scale: .8,
            pictureBounds: {top: 0, left: 64, width: 64, height: 64, scale: .75}
          },
          carriage: {
            pictures: {
              background: null,
              foreground: null
            },
            size: {
              width: 128, 
              height: 128,
            },
            scale: .8,
            pictureBounds: {top: 32, left: 32, width: 64, height: 64, scale: .75}
          }
        },
        audio: {
          enabled: true,
          volume: 1,
          fadingLength: 30,
          fadeOnCompletion: true,
          tracks: {
            '1': null,
            '2': null,
            '3': null,
            '4': null,
            '5': null
          }
        }
      },
      moderator: {
        enabled: false
      },
      poll: {
        enabled: false
      },
      prediction: {
        enabled: false
      },
      raid: {
        enabled: false
      },
      redemption: {
        enabled: false
      },
      reward: {
        enabled: false
      },
      subscription: {
        enabled: false
      },
      update: {
        enabled: false
      },
      //EventSubExtensionBitsTransactionCreateEvent ???
      online: {
        enabled: false
      }
      //EventSubUserUpdateEvent
    }
  },
  chatbot: {
    enabled: false,
    categories: {
      self: {
        enabled: false,
      },
      common: {
        enabled: false
      },
      pokemon: {
        enabled: false
      },
      moderators: {
        enabled: false
      },
      storeable: {
        enabled: false
      }
    }
  }
}

export const settingsSchema: Schema = new Schema({
  userId: Schema.Types.ObjectId,
  json: {
    type: Object,
    get: (data) => {
      try { return merge(SETTINGS_TEMPLATE, JSON.parse(data)) } catch(e) { return merge(SETTINGS_TEMPLATE, data) }
    },
    set: (data) => JSON.stringify(data),
    default: {}
  }
})
export const Settings = model('Settings', settingsSchema)
