import { Component, OnInit } from '@angular/core';
import { AuthGuard } from 'src/app/auth/auth.guard'
import { DataService } from 'src/app/shared/data.service'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  settings: any = {}
  constructor(public data: DataService, public auth: AuthGuard) { }

  async ngOnInit() {
    this.settings = await this.data.get(`user/${this.auth.currentUser?._id}/settings`)
  }


  

  async toggleApi() {

    if(!this.settings.api && this.settings.chatbot) {
      let response = window.confirm('If you disable the API the chatbot will be disabled as well.. would you like to do that?')
      if(!response) {
        this.settings.api = !this.settings.api
        return
      } else {
        let response = await this.data.get(`user/${this.auth.currentUser?._id}/settings/chatbot/disable`)
        if(response) {
          this.settings = response
          this.settings.api = false
        } else return
      }
    }
    let response = await this.data.get(`user/${this.auth.currentUser?._id}/settings/api/${this.settings.api ? 'enable' : 'disable'}`)
    if(response) {
      this.settings = response
    } else {
      this.settings.api = !this.settings.api
    }
    
  }

  async toggleChatBot() {

    if(this.settings.chatbot && !this.settings.api) {
      let response = window.confirm('To enable the chatbot you need to enable the API first.. would you like to do that?')
      if(!response) {
        setTimeout(() => {
          this.settings.chatbot = !this.settings.chatbot
        }, 50)
        return
      } else {
        let response = await this.data.get(`user/${this.auth.currentUser?._id}/settings/api/enable`)
        if(response) {
          this.settings = response
          this.settings.chatbot = true
        } else return
      }
    }

    let response = await this.data.get(`user/${this.auth.currentUser?._id}/settings/chatbot/${this.settings.chatbot ? 'enable' : 'disable'}`)
    if(response)
      this.settings = response
    else 
      this.settings.chatbot = !this.settings.chatbot
  }


  async save() {
    await this.data.post(`user/${this.auth.currentUser?._id}/settings`, this.settings)
  }

}
