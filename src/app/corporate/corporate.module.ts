
import { NgModule } from "@angular/core"
import { SharedNebularModule } from "../shared/nebular.module"
import { CorporateRoutingModule } from "./corporate-routing.module"
import { CorporateComponent } from "./corporate.component";
import { HomeComponent } from './home/home.component';
import { PrivacyComponent } from './privacy/privacy.component'
import { CommonModule } from "../common/common.module"




 @NgModule({
  imports: [
      CorporateRoutingModule,
      SharedNebularModule,
      CommonModule,
  ],
  declarations: [
      CorporateComponent,
      HomeComponent,
      PrivacyComponent,
  ],
 })
 export class CorporateModule { }