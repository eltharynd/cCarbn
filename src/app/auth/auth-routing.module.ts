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
        component: LoginComponent
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