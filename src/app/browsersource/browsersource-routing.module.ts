import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"

import { AlertsComponent } from "./elements/elements.component"
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
        component: HypetrainComponent,
        data: {
          title: 'Hype Train',
        },
      },
      {
        path: 'predictions',
        component: PredictionsComponent,
        data: {
          title: 'Predictions',
        },
      },
      {
        path: '**',
        component: AlertsComponent,
        data: {
          title: 'Browser Source',
        },
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrowserSourceRoutingModule {}