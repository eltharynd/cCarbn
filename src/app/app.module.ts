import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'


import { HttpModule  } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { SharedMaterialModule } from './sharedmaterial.module';

import { AppComponent } from './app.component';

@NgModule({
  imports: [
    HttpModule,
    BrowserModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    AppRoutingModule,
    SharedMaterialModule,
  ],
  declarations: [
    AppComponent,
  ],

  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
