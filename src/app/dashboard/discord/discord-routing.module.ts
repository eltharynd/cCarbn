import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { ApiComponent } from "./api/api.component"
import { DiscordComponent } from "./discord.component"
import { FunctionsComponent } from "./functions/functions.component"
import { HomeComponent } from "./home/home.component"



const routes: Routes = [
  {
    path: '',
    component: DiscordComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'api',
        component: ApiComponent
      },
      {
        path: 'functions',
        component: FunctionsComponent,
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiscordRoutingModule {}