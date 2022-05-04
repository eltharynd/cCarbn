import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { CorporateComponent } from "./corporate.component"
import { HomeComponent } from "./home/home.component"
import { PrivacyComponent } from "./privacy/privacy.component"


const routes: Routes = [
  {
    path: '',
    component: CorporateComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        data: {
          title: 'cCarbn - About Us',
          description: 'cCarbn is a cloud based All-in-One bot that allows you to interact with Twitch events and chat via Browser Source ready dynamic pages and chat.',
          ogTitle: 'Interact with Twitch events and chat via Browser Source ready dynamic pages and chat.'
        }
      },
      {
        path: 'privacy',
        component: PrivacyComponent,
        data: {
          title: 'cCarbn - Privacy policy',
          description: 'cCarbn is a cloud based All-in-One bot that allows you to interact with Twitch events and chat via Browser Source ready dynamic pages and chat.',
          ogTitle: 'Interact with Twitch events and chat via Browser Source ready dynamic pages and chat.'
        }
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorporateRoutingModule {}