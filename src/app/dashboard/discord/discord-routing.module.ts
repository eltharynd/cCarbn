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