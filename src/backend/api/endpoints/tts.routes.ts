import { User } from '../../db/models/user.model'
import { Mongo } from '../../db/mongo'
import { TTSProvider } from '../../external/tts.provider'
import { Api } from '../express'

export class TTSRoutes {
  static attach() {
    //TODO delete once assessed
    let logger: any
    let saveLogs = async () => {
      try {
        for (let twitchName of Object.keys(logger)) {
          let found: any = await User.findOne({ twitchName: twitchName })
          if (found) {
            if (!found.ttsStart) found.ttsStart = Date.now()

            if (+logger[twitchName] !== +found.ttsCharacters) {
              found.ttsCharacters = logger[twitchName]
              await found.save()
            }
          } else {
            console.error('could not find user for tmp logs')
          }
        }
      } catch (e) {
        console.error('could not save tmp logs')
        console.error(e)
      }
    }
    setTimeout(async () => {
      if (!logger) {
        logger = {}
        let users = await User.find()
        for (let u of users) {
          if (u.ttsStart) logger[u.twitchName] = +u.ttsCharacters
        }
      }
    }, 1000)
    Api.endpoints.get('/api/logger', async (req, res) => {
      res.send(logger)
    })

    Api.endpoints.get('/api/tts/:userId/:voice/:text', async (req, res): Promise<any> => {
      let text = req.params.text.replace(/\&questionmark\;/gi, '?')
      if (!text || text.length < 1) return res.status(400).send()

      let user: any = await User.findOne({ _id: Mongo.ObjectId(req.params.userId) })
      if (!user) return res.send(403).send()

      if (/^google_/.test(req.params.voice) || /^aws_/.test(req.params.voice)) {
        if (!logger.hasOwnProperty(user.twitchDisplayName)) logger[user.twitchDisplayName] = req.params.text.length
        else logger[user.twitchDisplayName] = logger[user.twitchDisplayName] + req.params.text.length
        saveLogs()
      }

      let result = await TTSProvider.convert(user, text, req.params.voice)
      if (!result) return res.status(500).send()
      try {
        res.set({
          'content-type': 'audio/mpeg',
        })
        result.pipe(res)
      } catch (e) {
        console.error(e)
        return res.status(500).send()
      }
    })
  }
}
