import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import axios from 'axios'
import { Observable, Subject } from 'rxjs';
import { SERVER_URL } from '../shared/data.service'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  public currentUser: User|null

  public static resumed: Subject<boolean> = new Subject<boolean>()

  constructor(private router: Router) {
    if (localStorage.currentUser) {
      this.resume()
    } else {
      AuthGuard.resumed.complete()
    }
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return new Promise(async resolve => {
        await AuthGuard.resumed.toPromise()
        if(this.currentUser) {
          resolve(true)
          return
        }
  
        this.router.navigate(['auth'])
        resolve(false)
      })
  }


  public login(user: User) {
    this.currentUser = user
    localStorage.currentUser = JSON.stringify(user)
    this.router.navigate([''])
  }

  public logout() {
    this.currentUser = null
    delete localStorage.currentUser
    this.router.navigate(['auth'])
  }

  public async resume() {
    try { this.currentUser = JSON.parse(localStorage.currentUser) }
    catch (error) { this.logout() }

    await axios.post(`${SERVER_URL}auth/resume`, this.currentUser).then(response => {
      this.currentUser = response.data
      localStorage.currentUser = JSON.stringify(response.data)
    }).catch(error => {
      this.currentUser = null
      if(!error.response) {
        console.error(error)
      } else if(error?.response?.status === 401)
        this.logout()
    })

    AuthGuard.resumed.complete()
  }
  
}


export interface User {
  _id: string,
  name: string,
  picture: string,
  token: string
}