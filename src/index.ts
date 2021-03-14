import tmi from 'tmi'

console.log('elthabot started')

const client = new tmi.Client({
    options: {
        debug: true
    },
    connectrion: {
        reconnect: true,
        secure: true
    },
    identity:  {
        username: 'elthabot',
        password: 'oauth:'
    }
})

