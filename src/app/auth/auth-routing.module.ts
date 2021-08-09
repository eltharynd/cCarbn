import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"

import { AuthComponent } from "./auth.component"
import { LoginComponent } from "./login/login.component"
import { ProfileComponent } from "./profile/profile.component"
import { TokenComponent } from "./token/token.component"

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        component: LoginComponent
      },
      {
        path: 'profile',
        component: ProfileComponent
      },
      {
        path: 'token',
        component: TokenComponent
      }
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}