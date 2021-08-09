import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { ApiComponent } from "./api/api.component"
import { ChatbotComponent } from "./chatbot/chatbot.component"
import { HomeComponent } from "./home/home.component"
import { TwitchComponent } from "./twitch.component"



const routes: Routes = [
  {
    path: '',
    component: TwitchComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'api',
        component: ApiComponent
      },
      {
        path: 'chatbot',
        component: ChatbotComponent,
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TwitchRoutingModule {}