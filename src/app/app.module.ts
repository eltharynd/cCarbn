import { NgModule, Pipe } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'

import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { AppRoutingModule } from './app-routing.module'

import { AppComponent } from './app.component'
import { SharedNebularModule } from './shared/nebular.module'
import { MessageComponent } from './message/message.component'
import { TimeDifferenceModule } from './shared/timediff.module'

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
  declarations: [AppComponent, MessageComponent],
  exports: [],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
