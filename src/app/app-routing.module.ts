import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard'
import { MessageComponent } from './message/message.component'

const routes: Routes = [
  {path: 'websource', component: MessageComponent},
  {path: 'websource/:any', component: MessageComponent},
  {path: 'websource/:any/:any2', component: MessageComponent},
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
    path: 'browsersource',
    //canActivate: [AuthGuard],
    loadChildren: () => import('./browsersource/browsersource.module').then(
      m => m.BrowserSourceModule
    ),
  },
  {path: '**', redirectTo: 'dashboard'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
