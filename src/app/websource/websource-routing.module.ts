import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { AuthGuard } from "../auth/auth.guard"

import { EventsComponent } from "./events/events.component"
import { HypetrainComponent } from "./hypetrain/hypetrain.component"
import { PredictionsComponent } from "./predictions/predictions.component"
import { WebSourceComponent } from "./websource.component"

const routes: Routes = [
  {
    path: '',
    component: WebSourceComponent,
  },
  {
    path: ':userId',
    component: WebSourceComponent,
    children: [
      {
        path: 'hypetrain',
        component: HypetrainComponent
      },
      {
        path: 'predictions',
        component: PredictionsComponent
      },
      {
        path: '**',
        component: EventsComponent
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebSourceRoutingModule {}