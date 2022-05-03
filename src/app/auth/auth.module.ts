import { NgModule } from "@angular/core"
import { SharedNebularModule } from "../shared/nebular.module"
import { AuthRoutingModule } from "./auth-routing.module"
import { AuthComponent } from "./auth.component";
import { LoginComponent } from './login/login.component';
import { TokenComponent } from './token/token.component';
import { ProfileComponent } from './profile/profile.component';
import { PairingComponent } from './pairing/pairing.component'



 @NgModule({
  imports: [
    AuthRoutingModule,
    SharedNebularModule,
  ],
  declarations: [
    AuthComponent,
    LoginComponent,
    TokenComponent,
    ProfileComponent,
    PairingComponent
  ],

 })
 export class AuthModule {}