import { Injectable } from '@angular/core';
import { Router } from '@angular/router'
import axios from 'axios'
import { AuthGuard } from '../auth/auth.guard'
import { io, Socket } from 'socket.io-client'

export const SERVER_URL = 'http://localhost:3000/api/'

@Injectable({
  providedIn: 'root'
})
export class DataService {
  busy: boolean = false
  socketIO: Socket

  static clientId
  
  constructor(private router: Router, private auth: AuthGuard) {
    
    this.socketIO = io(SERVER_URL.replace('api/', ''), {
      path: '/api/socket.io',
      transports: ['websocket']
    })


    this.socketIO.on('connect', () => {
    })
    this.socketIO.on('clientId', (data) => {
      DataService.clientId = data.clientId
    })

    this.socketIO.connect()

  }

  public async get(endpoint: string): Promise<any> {
    this.busy = true
    return new Promise<any>(resolve => {
      axios({
        method: 'get',
        url: `${SERVER_URL}${endpoint}`,
        headers: this.auth.currentUser?.token ? {'Authorization': `Basic ${this.auth.currentUser.token}`} : null
      }).then(response => {
        this.busy = false
        resolve(response.data)
      }).catch(error => {
        console.error(error)
        this.busy = false
        resolve(null)
        if(error?.response?.status === 403) {
          //AuthGuard.lastDeniedAccess = this.router.url
          this.router.navigate([`auth`])
        }
      })
    })
  }

  public async post(endpoint: string, data?: any): Promise<any> {
    this.busy = true
    return new Promise<any>(resolve => {
      axios({
        method: 'post',
        url: `${SERVER_URL}${endpoint}`,
        headers: this.auth.currentUser?.token ? {'Authorization': `Basic ${this.auth.currentUser.token}`} : null,
        data: data
      }).then(response => {
        this.busy = false
        resolve(response.data)
      }).catch(error => {
        console.error(error)
        this.busy = false
        resolve(null)
        if(error?.response?.status === 403) {
          //AuthGuard.lastDeniedAccess = this.router.url
          this.router.navigate([`auth`])
        }
      })
    }) 
  }
}
