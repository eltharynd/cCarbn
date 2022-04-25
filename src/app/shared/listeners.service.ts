import { Injectable } from '@angular/core';
import { AuthGuard } from '../auth/auth.guard'
import { DataService } from './data.service'

@Injectable({
  providedIn: 'root'
})
export class ListenersService {

  settings: any
  constructor(private data: DataService, private auth: AuthGuard) {
    this.init()
  }

  async init() {
    if(!this.settings)
      this.settings = await this.data.get(`user/${this.auth.currentUser?._id}/settings`)
  }

  async toggleApi() {
    await this.init()

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
    await this.init()

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
    await this.init()

    if(this.settings.api.listeners[listener].enabled) {
      if(!await this.data.post(`user/${this.auth.currentUser?._id}/settings/api/listener/${listener}/enable`, {enabled: true}))
        this.settings.api.listeners[listener].enabled = false
    } else {
      if(!await this.data.delete(`user/${this.auth.currentUser?._id}/settings/api/listener/${listener}/disable`))
        this.settings.api.listeners[listener].enabled = true
    }
  }

  async toggleCategory(category) {
    await this.init()

    if(this.settings.chatbot.categories[category].enabled) {
      if(!await this.data.post(`user/${this.auth.currentUser?._id}/settings/chatbot/category/${category}/enable`))
        this.settings.chatbot.categories[category].enabled = false
    } else {
      if(!await this.data.delete(`user/${this.auth.currentUser?._id}/settings/chatbot/category/${category}/disable`))
        this.settings.chatbot.categories[category].enabled = true
    }
  }

  async save() {
    await this.init()

    await this.data.post(`user/${this.auth.currentUser?._id}/settings`, this.settings)
  }

}
