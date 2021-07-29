import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule  } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StatusService } from './shared/status.service';
import { WebsourceComponent } from './websource/websource.component';
import { IndexComponent } from './index/index.component';
import { PredictionsComponent } from './websource/predictions/predictions.component';

@NgModule({
  declarations: [
    AppComponent,
    WebsourceComponent,
    IndexComponent,
    PredictionsComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [StatusService],
  bootstrap: [AppComponent]
})
export class AppModule { }
