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
  constructor(private data: DataService, public auth: AuthGuard) { }

  async ngOnInit() {
    this.settings = await this.data.get(`user/${this.auth.currentUser?._id}/settings`)
  }


  async toggleChatBot() {

    let result = await this.data.get(`user/${this.auth.currentUser?._id}/settings/chatbot/${this.settings.chatbot ? 'enable' : 'disable'}`)
    if(result)
      await this.save()
    else {
      this.settings.chatbot = !this.settings.chatbot
    }
  }

  async toggleApi() {

    let result = await this.data.get(`user/${this.auth.currentUser?._id}/settings/api/${this.settings.api ? 'enable' : 'disable'}`)
    if(result)
      await this.save()
    else {
      this.settings.api = !this.settings.api
    }
  }


  async save() {
    await this.data.post(`user/${this.auth.currentUser?._id}/settings`, this.settings)
  }

}
