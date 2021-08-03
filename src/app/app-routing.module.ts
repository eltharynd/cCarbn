import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { WebsourceComponent } from './websource/websource.component';

const routes: Routes = [
  {path: 'websource', component: WebsourceComponent},
  {path: 'websource/hypetrain', component: WebsourceComponent},
  {path: '**', component: IndexComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
