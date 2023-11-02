import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MyCalandarComponent } from './my-calandar/my-calandar.component';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    MyCalandarComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    NgbModalModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
  ],
  exports: [MyCalandarComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
