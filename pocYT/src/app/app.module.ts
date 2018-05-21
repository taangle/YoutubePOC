import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { YtRoutingModule } from './/yt-routing.module';
import { YtComponent } from './yt/yt.component';;
import { VideoDetailComponent } from './video-detail/video-detail.component'

@NgModule({
  declarations: [
      AppComponent,
      YtComponent
,
      VideoDetailComponent  ],
  imports: [
      BrowserModule,
      FormsModule,
      YtRoutingModule,
      HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
