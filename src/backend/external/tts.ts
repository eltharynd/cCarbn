var gtts = require('node-gtts')('en');

export class TTS {
    static async convert(text:any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            resolve(gtts.stream(text))
        })
    }
}