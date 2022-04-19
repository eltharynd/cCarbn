import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"

import { CheersComponent } from "./cheers/cheers.component"
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
        path: '**',
        component: EventsComponent
      },
      {
        path: 'cheer',
        component: CheersComponent
      },
      {
        path: 'hypetrain',
        component: HypetrainComponent
      },
      {
        path: 'prediction',
        component: PredictionsComponent
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebSourceRoutingModule {}