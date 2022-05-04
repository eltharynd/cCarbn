import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { AuthGuard } from "../auth/auth.guard"
import { DashboardComponent } from "./dashboard.component"
import { HomeComponent } from "./home/home.component"


const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        data: {
          title: 'Dashboard',
          description: 'In here you can customize and control all of your Settings, Alerts and Commands.'
        },
      },
      {
        path: 'twitch',
        canActivate: [AuthGuard],
        loadChildren: () => import('./twitch/twitch.module').then(
          m => m.TwitchModule
        ),
      },
      {
        path: 'discord',
        canActivate: [AuthGuard],
        loadChildren: () => import('./discord/discord.module').then(
          m => m.DiscordModule
        ),
      },
      {path: '**', redirectTo: ''}
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}