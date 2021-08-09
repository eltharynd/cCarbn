import { NgModule } from "@angular/core"
import { SharedMaterialModule } from "../shared/material.module"
import { SharedNebularModule } from "../shared/nebular.module"
import { AuthRoutingModule } from "./auth-routing.module"
import { AuthComponent } from "./auth.component";
import { LoginComponent } from './login/login.component';
import { TokenComponent } from './token/token.component';
import { ProfileComponent } from './profile/profile.component'



 @NgModule({
  imports: [
    AuthRoutingModule,
    SharedMaterialModule,
    SharedNebularModule,
  ],
  declarations: [
    AuthComponent,
    LoginComponent,
    TokenComponent,
    ProfileComponent
  ],

 })
 export class AuthModule {}