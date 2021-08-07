import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { map } from 'rxjs/operators'
import { AuthGuard } from './auth/auth.guard'
import { IndexComponent } from './index/index.component';
import { WebsourceComponent } from './websource/websource.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(
      m => m.AuthModule
    )
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then(
      m => m.DashboardModule
    ),
  },

  {
    path: 'websource', 
    component: WebsourceComponent
  },
  {path: 'websource/hypetrain', component: WebsourceComponent},
  {path: '**', redirectTo: 'dashboard'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
