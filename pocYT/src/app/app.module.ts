import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { YtRoutingModule } from './/yt-routing.module';
import { YtComponent } from './yt/yt.component';
import { VideoDetailComponent } from './video-detail/video-detail.component';
import { AuthComponent } from './auth/auth.component';

import { GoogleApiModule, GoogleApiService, GoogleAuthService, NgGapiClientConfig, NG_GAPI_CONFIG, GoogleApiConfig } from "ng-gapi";;

//personal client ID, required YouTube discovery doc, YouTube authentication scope for OAuth2
let gapiClientConfig: NgGapiClientConfig = {
    client_id: "384382936305-q9jtiflffe22ai3pghk9rt991cqg29ji.apps.googleusercontent.com",
    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"],
    scope: ["https://www.googleapis.com/auth/youtube"].join(" ")
};

@NgModule({
  declarations: [
      AppComponent,
      YtComponent,
      VideoDetailComponent,
      AuthComponent
    ],
  imports: [
      BrowserModule,
      FormsModule,
      YtRoutingModule,
      HttpClientModule,
      GoogleApiModule.forRoot({
          provide: NG_GAPI_CONFIG,
          useValue: gapiClientConfig
      })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
