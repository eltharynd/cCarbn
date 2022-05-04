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
          title: 'About Us'
        }
      },
      {
        path: 'privacy',
        component: PrivacyComponent,
        data: {
          title: 'Privacy policy',
          descrion: 'Read about what kind of data we collect and how we handle it'
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