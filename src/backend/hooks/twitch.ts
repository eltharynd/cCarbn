import * as api from 'twitch-api-v5'
import * as util from 'util'
import { CREDENTIALS } from "../index"

export class Twitch {


    public static init() {
        // @ts-ignore
        api.clientID = CREDENTIALS.clientID
    }


    public static searchChannel = async (name, live?: boolean): Promise<any> => {
        let search = util.promisify(api.search.channels)

        // @ts-ignore
        return await search({
            query: name
        })
    }


    public static getStream = async (channelID): Promise<any> => {
        let read = util.promisify(api.streams.channel)

        return (await read({
            channelID: channelID
        })).stream
    }

}