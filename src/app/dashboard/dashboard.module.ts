import { NgModule } from "@angular/core"
import { SharedMaterialModule } from "../sharedmaterial.module"
import { DashboardRoutingModule } from "./dashboard-routing.module"
import { DashboardComponent } from "./dashboard.component";
import { MainComponent } from './main/main.component'




 @NgModule({
  imports: [
    DashboardRoutingModule,
    SharedMaterialModule,
  ],
  declarations: [
    DashboardComponent,
    MainComponent
  ],

 })
 export class DashboardModule {}