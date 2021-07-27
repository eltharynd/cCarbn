import { Message } from "./utils"

export class Saved extends Message {

    public constructor(client) {
        super(client)
        this.init()
        
    }
    

    private saved = (channel, tags, message, self) => {
        let name = 'test'
        let params: string[] = []
        let command = 'test works!'

        let tester = "\^!" + name
        for(let p of params)
            tester += `\\s${p.startsWith('@') ? '@\\w+' : '\\w+'}`

        if(new RegExp(tester, 'i').test(message) ) {
            this.client.say(channel, `/me ${command}`)
        }
    }

}

