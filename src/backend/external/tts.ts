import { Stream } from 'stream'
import * as fs from 'fs'

const gtts = {
    'en-au': require('node-gtts')('en-au'),
    'en-uk': require('node-gtts')('en-uk'),
    'en-us': require('node-gtts')('en-us'),
}
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { Polly, StartSpeechSynthesisTaskInput } from '@aws-sdk/client-polly'

export class TTS {

    private static googleClient = new TextToSpeechClient({
        keyFile: 'google_credentials.json',
    })
    private static amazonClient = new Polly({
        region: 'eu-west-1',
        credentials: JSON.parse(''+fs.readFileSync('aws_credentials.json'))
    })

    static async convert(user, text:any, voice?: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let _voice
                if(/^google_/.test(voice) && (user.founder || user.supporter || user.premium)) {

                    _voice = voice.replace(/^google_/, '')
                    if(!user.premium) {
                        _voice = _voice.replace('Wavenet', 'Standard')
                    }

                    let request: any = {
                        input: { text: text },
                        voice: { languageCode: 'en-US', name: _voice },
                        audioConfig: { audioEncoding: 'MP3', speakingRate: 1.1 }
                    }
                    let [response] = await TTS.googleClient.synthesizeSpeech(request)
                    if(response.audioContent instanceof Uint8Array) {
                        const readStream = new Stream.PassThrough()
                        readStream.end(response.audioContent)

                        return resolve(readStream)
                    } else
                        return reject(null)
                    
                } else if(/^amazon_/.test(voice) && (user.founder || user.supporter || user.premium)) {

                    _voice = voice.replace(/^amazon_/, '')
                    let neural = /^neural_/.test(_voice)
                    _voice = _voice.replace(/^neural_/,'')

                    let request: StartSpeechSynthesisTaskInput = {
                        OutputFormat: 'mp3',
                        OutputS3BucketName: 'videoanalyzerbucket',
                        Text: text,
                        TextType: 'text',
                        VoiceId: _voice,
                        SampleRate: '22050',
                        Engine: neural && user.premium ? 'neural' : 'standard',
                    }

                    let response = await TTS.amazonClient.synthesizeSpeech(request)
                    if(response?.AudioStream) {
                        return resolve(response.AudioStream)
                    } else {
                        return reject(null) 
                    }
                }

                _voice = TTSVoices[voice]
                resolve(gtts[voice ? voice : TTSVoices.us].stream(text))

            } catch(e) {
                console.error(e)
                resolve(null)
            }
        })
    }
}

export enum TTSVoices {
    au = 'en-au',
    uk = 'en-uk',
    us = 'en-us',
    google_en = 'en_us',
    amazon_joanna = 'Joanna'
}
