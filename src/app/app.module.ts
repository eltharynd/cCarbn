import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'

import { AppRoutingModule } from './app-routing.module';
import { SharedMaterialModule } from './shared/material.module';

import { AppComponent } from './app.component';
import { SharedNebularModule } from './shared/nebular.module'

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    AppRoutingModule,

    SharedMaterialModule,
    SharedNebularModule,
  ],
  declarations: [
    AppComponent,
  ],

  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
