import { NgModule } from '@angular/core';
import { HttpModule  } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { SharedMaterialModule } from './sharedmaterial.module';

import { AppComponent } from './app.component';
import { StatusService } from './shared/status.service';
import { WebsourceComponent } from './websource/websource.component';
import { IndexComponent } from './index/index.component';
import { PredictionsComponent } from './websource/predictions/predictions.component';
import { HypetrainComponent } from './websource/hypetrain/hypetrain.component';

@NgModule({
  declarations: [
    AppComponent,
    WebsourceComponent,
    IndexComponent,
    PredictionsComponent,
    HypetrainComponent,
  ],
  imports: [
    HttpModule,
    AppRoutingModule,
    SharedMaterialModule,
  ],
  providers: [StatusService],
  bootstrap: [AppComponent]
})
export class AppModule { }
