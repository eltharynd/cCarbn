

export const filterParameters = (message) =>  {
    let parameters = message.split(' ')
    parameters.shift()
    return parameters
}


export class Message {
    protected client
    private cooldowns = {}
    constructor(client) {this.client = client}
    protected init = () => {
        let keys = []
        for(let key of Object.keys(this)) 
            if(typeof this[key] === 'function' && key !== 'init' && key !== 'timeout' && key !== 'fetch' && key !== 'exists' && key !== 'mod' && key !== 'generateListener')
                keys.push(key)
        this.client.on('message', (channel, tags, message, self) => {
            if(self) return 
            for(let key of keys) 
                this[key](channel, tags, message, self)
        })   
    }
    protected timeout = (timeInSeconds?: number, identifier?: string): boolean => {
        let caller = identifier ? identifier : (new Error).stack.split('\n')[2].replace(/^.*\.\_this\./,'').replace(/ \(.*\)$/,'')
        if(timeInSeconds && Date.now() - this.cooldowns[caller] < timeInSeconds * 1000) {
            return true
        } else {
            this.cooldowns[caller] = Date.now()
            return false
        }
    }
}