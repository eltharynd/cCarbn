import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"

import { EventsComponent } from "./events/events.component"
import { HypetrainComponent } from "./hypetrain/hypetrain.component"
import { PredictionsComponent } from "./predictions/predictions.component"
import { BrowserSourceComponent } from "./browsersource.component"

const routes: Routes = [
  {
    path: '',
    component: BrowserSourceComponent,
  },
  {
    path: ':userId',
    component: BrowserSourceComponent,
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
export class BrowserSourceRoutingModule {}