import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import axios from 'axios'
import { Observable } from 'rxjs';
import { SERVER_URL } from '../shared/data.service'

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  public currentUser

  constructor(private router: Router) {
    if (localStorage.currentUser) this.resume()
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if(this.currentUser) return true

      this.router.navigate(['auth'])
      return false
  }


  public login(user: string) {
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
    try {
      this.currentUser = JSON.parse(localStorage.currentUser)
      let response = await axios.post(`${SERVER_URL}auth/resume`, this.currentUser)
      if(response?.data) {
        this.currentUser = response.data
        localStorage.currentUser = JSON.stringify(response.data)
      } else this.logout()
    } catch {
      this.logout()
    }
  }
  
}
