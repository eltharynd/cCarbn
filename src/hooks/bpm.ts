import * as noble from 'noble'
import * as crypto from 'crypto'
import * as SocketIO from 'socket.io'
import { Socketable } from './socket'

const SECRET_KEY = [0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x40, 0x41, 0x42, 0x43, 0x44, 0x45]

export class BPM implements Socketable{

    private io: SocketIO.Server

    private device: noble.Peripheral
    private reading
    private force
    private bpm

    private connections = 0



    constructor() {
        //this.connect()
    }


    public async events(socket, io: SocketIO.Server) {
        this.io = io

        socket.on('bpm_connect', async (data) => {
            console.log('bpm connected', data)
            this.connections++

            setTimeout(() => {
                if(!this.device)
                    this.connect()
                socket.emit('bpm_updater', {
                    connected: this.device ? true : false,
                    reading: this.reading ? true : false,
                    bpm: this.bpm ? this.bpm : null
                })
    
                socket.on('disconnect', async (data) => {
                    console.log('disconnected')
                    if(socket.updater) {
                        clearInterval(socket.updater)
                        socket.updater = null
                    }
    
                    if(--this.connections===0) {
                        this.disconnect()
                    }
                        
                })
            }, 1000) 
        })


    }

    connect = async () => {

        noble.startScanning(['fee0'], false)
       /*  noble.on('stateChange', (state) => {
            if (state === 'poweredOn') {
                console.log('Looking for Bluetooth devices')
                noble.startScanning(['fee0'], false)
            } else {
                console.log('Stopping')
                noble.stopScanning()
            }
        }) */

       

        noble.on('discover', (peripheral) =>  {
            //console.log(peripheral.advertisement.localName)
            if(peripheral.advertisement.localName === 'Mi Band 3') {
                //console.log('connecting')
                peripheral.connect((error) => {
                    //console.log('connected to peripheral: ' + peripheral.uuid)
                    
                    //this.device = peripheral

                    peripheral.discoverServices(['fee0', 'fee1', '180d'], async (error, services) => {
                        let miband1: noble.Service
                        let miband2: noble.Service
                        let hrm: noble.Service

                        for(let s of services) {
                            //console.log(s.uuid, s.name)
                            if(s.uuid === 'fee0')
                                miband1 = s
                            else if(s.uuid === 'fee1')
                                miband2 = s
                            else if(s.uuid === '180d')
                                hrm = s
                        }

                        //console.log('Connected to services')

                        miband2.discoverCharacteristics(['000000090000351221180009af100700'], async (error, characteristics) => {
                            //console.log('auth found', error, characteristics)
                            let auth: noble.Characteristic
                            for(let c of characteristics) {
                                //console.log(c)
                                if(c.uuid === '000000090000351221180009af100700')
                                    auth = c
                            }

                            auth.subscribe((error) => {
                                auth.write(Buffer.from([0x01, 0x08].concat(SECRET_KEY)), true, (error) => {
                                    auth.once('data', (data, isNotif) => {
                                        if(data[0] === 0x10 && data[1] === 0x01 && data[2] === 0x01) {
                                            //console.log('Successfully sent secret key')

                                            
                                            auth.write(Buffer.from([0x02, 0x08]), true, (error) => {
                                                auth.on('data', (data, isNotif) => {
                                                    if(data[0] === 0x10 && data[1] === 0x02 && data[2] === 0x01) {
                                                        //console.log('random auth key received', data)
                                                        
                                                        let cipher =  crypto.createCipheriv('aes-128-ecb', Buffer.from(SECRET_KEY), '').setAutoPadding(false)
                                                        let encrypted: Buffer = Buffer.concat([cipher.update(data.slice(3)), cipher.final()])
                

                                                        auth.write(Buffer.from([0x03, 0x08].concat(JSON.parse(JSON.stringify(encrypted)).data)), true, (error) => {
                                                            auth.once('data', (data, isNotif) => {
                                                                if(data[0] === 0x10 && data[1] === 0x03 && data[2] === 0x01) {
                                                                    //console.log('authentication successfull', data)
                                                                    this.device = peripheral
                                                                    this.io.emit('bpm_updater', {
                                                                        connected: this.device ? true : false,
                                                                        reading: this.reading ? true : false,
                                                                        bpm: this.bpm ? this.bpm : null
                                                                    })


                                                                    hrm.discoverCharacteristics([], async (error, characteristics) => {
                                                                        //console.log('characteristics', characteristics)
                                                
                                                                        let hrm_ctrl: noble.Characteristic
                                                                        let hrm_data: noble.Characteristic
                                                
                                                                        for(let c of characteristics) {
                                                                            //console.log(c.uuid)
                                                                            if(c.uuid === '2a39')
                                                                                hrm_ctrl = c
                                                                            else if(c.uuid === '2a37')
                                                                                hrm_data = c
                                                                        }


                                                                        //console.log('setting that shit up')

                                                                        hrm_data.addListener('data', (data) => {
                                                      
                                                                            //console.log('hrm_data listener', data)
                                                                            if(data) {
                                                                                this.bpm = data[1]
                                                                            } else {
                                                                                this.bpm = null
                                                                            }
                                                                            
                                                                            this.io.emit('bpm_updater', {
                                                                                connected: this.device ? true : false,
                                                                                reading: this.reading ? true : false,
                                                                                bpm: this.bpm ? this.bpm : null
                                                                            })
                                                                         
                                                                        })
                                                                        //STOP MANUAL
                                                                        hrm_ctrl.write(Buffer.from([0x15, 0x02, 0x00]), true, (error) => {
                                                                            //STOP CONTINUOS
                                                                            hrm_ctrl.write(Buffer.from([0x15, 0x01, 0x00]), true, (error) => {

                                            
                                                                                    
                                                                                
                                                                                //START NOTIFS
                                                                                hrm_data.subscribe((error) => {
                                                                                    //console.log('hrm_data subscribed', error)
                                                                            
                                                                                    /* setInterval(() => {
                                                                                        hrm_data.read((data) => {
                                                                                            if(data) {
                                                                                                console.log('----------------------MANUALLY READ')
                                                                                                this.bpm = data[1]
                                                                                                this.io.emit('bpm_updater', {
                                                                                                    connected: this.device ? true : false,
                                                                                                    reading: this.reading ? true : false,
                                                                                                    bpm: this.bpm ? this.bpm : null
                                                                                                })
                                                                                            } else {
                                                                                                this.bpm = null
                                                                                            }
                                                                                            
                                                                                            
                                                                                        })
                                                                                    }, 5000) */
                                                                                    
                                                                                    hrm_data.on('data', (data, isNotif) => {
                                                                                        console.log('hrm_data', data, isNotif)
                                                                                        if(data) {
                                                                                            this.bpm = data[1]
                                                                                        } else {
                                                                                            this.bpm = null
                                                                                        }
                                                                                        
                                                                                        this.io.emit('bpm_updater', {
                                                                                            connected: this.device ? true : false,
                                                                                            reading: this.reading ? true : false,
                                                                                            bpm: this.bpm ? this.bpm : null
                                                                                        })
                                                                                        
                                                                                    })

                                                                                    //START CONTINUOS
                                                                                    hrm_ctrl.write(Buffer.from([0x15, 0x01, 0x01]), true, (error) => {
                                                                                        console.log('Started BPM.......')
                                                                                        if(!this.reading)
                                                                                            this.reading = setInterval(() => {
                                                                                                //console.log('BPM ping...')
                                                                                                hrm_ctrl.write(Buffer.from([0x16]), true, (error) => {/* console.log('pinging error', error) */})
                                                                                            }, 12000)
                                                                                        
                                                                                        /* if(!this.force)
                                                                                            this.force = setInterval(() =>  {
                                                                                                hrm_data.read((error, data) => {
                                                                                                    console.log('FORCE READ', data)
                                                                                                    if(data) {
                                                                                                        this.bpm = data[1]

                                                                                                        
                                                                                                        this.io.emit('bpm_updater', {
                                                                                                            connected: this.device ? true : false,
                                                                                                            reading: this.reading ? true : false,
                                                                                                            bpm: this.bpm ? this.bpm : null
                                                                                                        }) 

                                                                                                    }

                                                                                                })
                                                                                            }, 5000) */

                                                                                    })

                                                                                }) 

                                                                            })

                                                                        })

                                                                    })

                                                                } else {
                                                                    console.log('authentication failed', data)   
                                                                }
                                                            })
                                                        })
                                                    }
                                                })
                                            })

                                        }
                                    }) 
                                })
                            })


                            

                        })        
                    })

                })
            }    
        })
    }

    disconnect = async () => {
        noble.stopScanning()

        if(this.reading) {
            clearInterval(this.reading)
            this.reading = null
        }
        if(this.force) {
            clearInterval(this.force)
            this.force = null
        }
        if(this.device) {
            this.device.disconnect()
            this.device = null
        }

        this.bpm = null

        this.io.emit('bpm_updater', {
            connected: this.device ? true : false,
            reading: this.reading ? true : false,
            bpm: this.bpm ? this.bpm : null
        })
    }


}