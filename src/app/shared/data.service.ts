import { Injectable } from '@angular/core';
import { Router } from '@angular/router'
import axios from 'axios'
import { AuthGuard } from '../auth/auth.guard'
import { io, Socket } from 'socket.io-client'
import { environment } from 'src/environments/environment'
import { Subject } from 'rxjs'

export const SERVER_URL = environment?.production ? 'https://cCarbn.io/api/' : 'http://localhost:3000/api/'


@Injectable({
  providedIn: 'root'
})
export class DataService {
  busy: boolean = false
  socketIO: Socket

  static clientId
  _clientId

  userId: Subject<string> = new Subject()
  _userId: string

  constructor(private router: Router, private auth: AuthGuard) {
    
    this.socketIO = io(SERVER_URL.replace('api/', ''), {
      path: '/api/socket.io',
      transports: ['websocket']
    })

    this.socketIO.on('connect', () => {
      if(this._userId) {
        this.socketIO.emit('bind', {
          userId: this._userId
        })
      }
    })

    this.userId.subscribe((userId) => {
      this._userId = userId
      if(this.socketIO.connected)
        this.socketIO.emit('bind', {
          userId: this._userId
        })
    })

    this.auth.userChanged.subscribe(user => {
      if(user?._id) this.userId.next(user?._id)
    })

    this.socketIO.on('clientId', (data) => {
      DataService.clientId = data.clientId
      this._clientId = data.clientId
    })

    this.socketIO.connect()
  }

  public async send(name, data?) {
    this.socketIO.emit(name, data)
  }

  public async get(endpoint: string): Promise<any> {
    this.busy = true
    return new Promise<any>(resolve => {
      axios({
        method: 'get',
        url: `${SERVER_URL}${endpoint}`,
    
        headers: this.auth.currentUser?.token ? {'Authorization': `Basic ${this.auth.currentUser.token}`} : {}
      }).then(response => {
        this.busy = false
        resolve(response.data)
      }).catch(error => {
        console.error(error)
        this.busy = false
        if(error?.response?.status === 403) {
          //AuthGuard.lastDeniedAccess = this.router.url
          this.router.navigate([`auth`])
        }
        resolve(null)
      })
    })
  }

  public async post(endpoint: string, data?: any): Promise<any> {
    this.busy = true
    return new Promise<any>(resolve => {
      axios({
        method: 'post',
        url: `${SERVER_URL}${endpoint}`,
        headers: this.auth.currentUser?.token ? {'Authorization': `Basic ${this.auth.currentUser.token}`} : {},
        data: data
      }).then(response => {
        this.busy = false
        resolve(response.data)
      }).catch(error => {
        console.error(error)
        this.busy = false
        if(error?.response?.status === 403) {
          //AuthGuard.lastDeniedAccess = this.router.url
          this.router.navigate([`auth`])
        }
        resolve(null)
      })
    }) 
  }

  public async patch(endpoint: string, data?: any): Promise<any> {
    this.busy = true
    return new Promise<any>(resolve => {
      axios({
        method: 'patch',
        url: `${SERVER_URL}${endpoint}`,
        headers: this.auth.currentUser?.token ? {'Authorization': `Basic ${this.auth.currentUser.token}`} : {},
        data: data
      }).then(response => {
        this.busy = false
        resolve(response.data)
      }).catch(error => {
        console.error(error)
        this.busy = false
        if(error?.response?.status === 403) {
          //AuthGuard.lastDeniedAccess = this.router.url
          this.router.navigate([`auth`])
        }
        resolve(null)
      })
    }) 
  }

  public async delete(endpoint: string): Promise<any> {
    this.busy = true
    return new Promise<any>((resolve, reject) => {
      axios({
        method: 'delete',
        url: `${SERVER_URL}${endpoint}`,
        headers: this.auth.currentUser?.token ? {'Authorization': `Basic ${this.auth.currentUser.token}`} : {},
      }).then(response => {
        this.busy = false
        resolve(response.data)
      }).catch(error => {
        console.error(error)
        this.busy = false
        if(error?.response?.status === 403) {
          //AuthGuard.lastDeniedAccess = this.router.url
          this.router.navigate([`auth`])
        }
        reject(error)
      })
    }) 
  }
}
