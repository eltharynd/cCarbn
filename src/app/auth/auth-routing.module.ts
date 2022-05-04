import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"

import { AuthComponent } from "./auth.component"
import { LoginComponent } from "./login/login.component"
import { PairingComponent } from "./pairing/pairing.component"
import { ProfileComponent } from "./profile/profile.component"
import { TokenComponent } from "./token/token.component"

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: {
          title: 'cCarbn - Login',
          description: 'cCarbn is a cloud based All-in-One bot that allows you to interact with Twitch events and chat via Browser Source ready dynamic pages and chat.',
          ogTitle: 'Interact with Twitch events and chat via Browser Source ready dynamic pages and chat.'
        },
      },
      {
        path: 'pairing/:pairingKey',
        component: PairingComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'token',
        component: TokenComponent
      },
      {path: '**', redirectTo: 'login'}
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}