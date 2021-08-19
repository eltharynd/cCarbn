import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthGuard } from 'src/app/auth/auth.guard'
import { DataService, SERVER_URL } from 'src/app/shared/data.service'
import { environment } from 'src/environments/environment'
@Component({
  selector: 'app-main',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  url = environment?.production ? 'https://cCarbn.io/' : 'http://localhost:4200/'
  object = Object


  settings: any
  constructor(public data: DataService, public auth: AuthGuard) { }

  async ngOnInit() {
    this.settings = await this.data.get(`user/${this.auth.currentUser?._id}/settings`)
  }


  

  async toggleApi() {

    if(!this.settings.api.enabled && this.settings.chatbot.enabled) {
      let response = window.confirm('If you disable the API the chatbot will be disabled as well.. would you like to do that?')
      if(!response) {
        this.settings.api.enabled = !this.settings.api.enabled
        return
      } else {
        let response = await this.data.get(`user/${this.auth.currentUser?._id}/settings/chatbot/disable`)
        if(response) {
          this.settings = response
          this.settings.api.enabled = false
        } else return
      }
    }
    let response = await this.data.get(`user/${this.auth.currentUser?._id}/settings/api/${this.settings.api.enabled ? 'enable' : 'disable'}`)
    if(response) {
      this.settings = response
    } else {
      this.settings.api.enabled = !this.settings.api.enabled
    }
    
  }

  async toggleChatBot() {

    if(this.settings.chatbot.enabled && !this.settings.api.enabled) {
      let response = window.confirm('To enable the chatbot you need to enable the API first.. would you like to do that?')
      if(!response) {
        setTimeout(() => {
          this.settings.chatbot.enabled = !this.settings.chatbot.enabled
        }, 50)
        return
      } else {
        let response = await this.data.get(`user/${this.auth.currentUser?._id}/settings/api/enable`)
        if(response) {
          this.settings = response
          this.settings.chatbot.enabled = true
        } else return
      }
    }

    let response = await this.data.get(`user/${this.auth.currentUser?._id}/settings/chatbot/${this.settings.chatbot.enabled ? 'enable' : 'disable'}`)
    if(response)
      this.settings = response
    else 
      this.settings.chatbot.enabled = !this.settings.chatbot.enabled
  }

  async toggleListener(listener) {
    if(this.settings.api.listeners[listener].enabled) {
      if(!await this.data.post(`user/${this.auth.currentUser?._id}/settings/api/listener/${listener}/enable`, {enabled: true}))
        this.settings.api.listeners[listener].enabled = false
    } else {
      if(!await this.data.delete(`user/${this.auth.currentUser?._id}/settings/api/listener/${listener}/disable`))
        this.settings.api.listeners[listener].enabled = true
    }
  }

  async toggleCategory(category) {
    if(this.settings.chatbot.categories[category].enabled) {
      if(!await this.data.post(`user/${this.auth.currentUser?._id}/settings/chatbot/category/${category}/enable`))
        this.settings.chatbot.categories[category].enabled = false
    } else {
      if(!await this.data.delete(`user/${this.auth.currentUser?._id}/settings/chatbot/category/${category}/disable`))
        this.settings.chatbot.categories[category].enabled = true
    }
  }

  async save() {
    await this.data.post(`user/${this.auth.currentUser?._id}/settings`, this.settings)
  }

}
