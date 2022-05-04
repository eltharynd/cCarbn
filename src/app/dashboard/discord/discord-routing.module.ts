import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { DiscordAPIComponent } from "./discordapi/discordapi.component"
import { DiscordComponent } from "./discord.component"
import { FunctionsComponent } from "./functions/functions.component"



const routes: Routes = [
  {
    path: '',
    component: DiscordComponent,
    children: [
      {
        path: 'api',
        component: DiscordAPIComponent,
        data: {
          title: 'Discord API Connections',
        },
      },
      {
        path: 'functions',
        component: FunctionsComponent,
        data: {
          title: 'Discord functions',
        },
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiscordRoutingModule {}