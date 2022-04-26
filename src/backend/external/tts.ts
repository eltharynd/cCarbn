const gtts = {
    'en-au': require('node-gtts')('en-au'),
    'en-uk': require('node-gtts')('en-uk'),
    'en-us': require('node-gtts')('en-us'),
}

export class TTS {
    static async convert(text:any, voice?: TTSVoices): Promise<any> {
        return new Promise(async (resolve, reject) => {
            resolve(gtts[voice ? voice : TTSVoices.us].stream(text))
        })
    }
}

export enum TTSVoices {
    au = 'en-au',
    uk = 'en-uk',
    us = 'en-us',
}