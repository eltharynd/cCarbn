import { NgModule } from "@angular/core"
import { SharedMaterialModule } from "../shared/material.module"
import { SharedNebularModule } from "../shared/nebular.module"
import { DashboardRoutingModule } from "./dashboard-routing.module"
import { DashboardComponent } from "./dashboard.component";
import { MainComponent } from './main/main.component'




 @NgModule({
  imports: [
    DashboardRoutingModule,
    SharedMaterialModule,
    SharedNebularModule,
  ],
  declarations: [
    DashboardComponent,
    MainComponent
  ],

 })
 export class DashboardModule {}