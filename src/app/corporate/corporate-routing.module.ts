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
        component: HomeComponent
      },
      {
        path: 'privacy',
        component: PrivacyComponent
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorporateRoutingModule {}