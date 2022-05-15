import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./corporate/corporate.module').then((m) => m.CorporateModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'browsersource',
    //canActivate: [AuthGuard],
    loadChildren: () => import('./browsersource/browsersource.module').then((m) => m.BrowserSourceModule),
  },
  { path: '**', redirectTo: '' },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
