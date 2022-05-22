import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { ElementsComponent } from './elements/elements.component'
import { HypetrainComponent } from './hypetrain/hypetrain.component'
import { PredictionsComponent } from './predictions/predictions.component'
import { BrowserSourceComponent } from './browsersource.component'
import { GlobalComponent } from './global/global.component'

const routes: Routes = [
  {
    path: 'hypetrain',
    component: BrowserSourceComponent,
    data: {
      title: 'test',
      route: 'hypetrain',
    },
  },
  {
    path: ':userId',
    component: BrowserSourceComponent,
    children: [
      {
        path: 'elements',
        component: ElementsComponent,
        data: {
          title: 'Browser Source - Elements',
        },
      },
      {
        path: 'hypetrain',
        component: HypetrainComponent,
        data: {
          title: 'Browser Source - Hype Train',
        },
      },
      {
        path: 'predictions',
        component: PredictionsComponent,
        data: {
          title: 'Browser Source - Predictions',
        },
      },
      {
        path: '**',
        component: GlobalComponent,
        data: {
          title: 'Browser Source - Global',
        },
      },
    ],
  },
  {
    path: '',
    redirectTo: '/dashboard',
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BrowserSourceRoutingModule {}
