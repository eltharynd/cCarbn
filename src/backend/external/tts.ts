import * as fs from 'fs'
import * as util from 'util'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

export class TTS {
    private static client = new TextToSpeechClient({
        keyFile: 'tts_credentials.json',
    })

    static async convertTTS(text: any): Promise<Uint8Array> {
        return new Promise(async (resolve, reject) => {
            try {
                let audioFileName = `${Date.now().toString()}.mp3`
                let request: any = {
                    input: { text: text },
                    voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
                    audioConfig: { audioEncoding: 'MP3', speakingRate: 1.1 }
                }
                let [response] = await TTS.client.synthesizeSpeech(request)
                if(response.audioContent instanceof Uint8Array)
                    resolve(response.audioContent)
                else
                    reject(null)
            } catch(e) {
                console.error(e)
                reject(null)
            }
        })
    }
}