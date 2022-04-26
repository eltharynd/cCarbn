import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'

import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SharedNebularModule } from './shared/nebular.module';
import { MessageComponent } from './message/message.component';


@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    //NoopAnimationsModule,

    FormsModule,
    ReactiveFormsModule,

    AppRoutingModule,

    SharedNebularModule,
  ],
  declarations: [
    AppComponent,
    MessageComponent,
  ],

  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
