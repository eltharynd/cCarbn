import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import axios from 'axios'
import { Observable, Subject } from 'rxjs';
import { SERVER_URL } from '../shared/data.service'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  public currentUser: User
  public userChanged: Subject<User> = new Subject()

  public instanceResumed: boolean = false
  public resumedDone: Subject<boolean> = new Subject<boolean>()

  constructor(private router: Router) {
    if (localStorage.currentUser) {
      this.resume()
    } else {
      this.resumedDone.complete()
    }
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return new Promise(async resolve => {
        await this.resumedDone.toPromise()
        if(this.currentUser) {
          resolve(true)
          return
        }
  
        this.router.navigate(['auth'])
        resolve(false)
      })
  }


  public login(user: User, noRedirect?: boolean) {
    this.currentUser = user
    localStorage.currentUser = JSON.stringify(user)
    this.userChanged.next(this.currentUser)
    if(!noRedirect)
      this.router.navigate(['/dashboard'])
  }

  public logout(noRedirect?: boolean) {
    this.currentUser = null
    delete localStorage.currentUser
    this.userChanged.next(null)
    if(!noRedirect)
      this.router.navigate(['auth'])
  }

  public async resume() {
    let buffer
    try { buffer = JSON.parse(localStorage.currentUser) }
    catch (error) { this.logout() }

    await axios.post(`${SERVER_URL}auth/resume`, buffer).then(response => {
      this.currentUser = response.data
      this.userChanged.next(this.currentUser)
      localStorage.currentUser = JSON.stringify(response.data)
      this.instanceResumed = true
    }).catch(error => {
      this.currentUser = null
      this.userChanged.next(null)
      if(!error.response) {
        console.error(error)
      } else if(error?.response?.status === 401)
        this.logout()
    })

    this.resumedDone.complete()
  }
  
}


export interface User {
  _id: string,
  name: string,
  founder: boolean,
  supporter: boolean,
  premium: boolean,
  picture: string,
  token: string
  settings: object
}