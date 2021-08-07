import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { io, Socket } from 'socket.io-client'

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private statusUrl = '/api/status';
  socketIO: Socket

  constructor(private http: Http) {
    this.socketIO = io('http://localhost:3000/', {
      path: '/api/socket.io',
      transports: ['websocket']
    })

    //this.socketIO.connect()
    this.socketIO.on('connect', () => {
    })

    
  }

  getStatus(): Promise<void | any> {
    return this.http.get(this.statusUrl)
               .toPromise()
               .then(response => response.json())
               .catch(this.error);
  }

  private error (error: any) {
    let message = (error.message) ? error.message :
    error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(message);
  }
}
