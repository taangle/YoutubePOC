import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';

import { AppComponent } from './app.component';
import { YtRoutingModule } from './/yt-routing.module';
import { YtComponent } from './yt/yt.component';
import { VideoDetailComponent } from './video-detail/video-detail.component';
import { AuthComponent } from './auth/auth.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { PlayComponent } from './play/play.component';
import { SafePipe } from './safe.pipe';

import { GoogleApiModule, GoogleApiService, GoogleAuthService, NgGapiClientConfig, NG_GAPI_CONFIG, GoogleApiConfig } from "ng-gapi";

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
    AuthComponent,
    UserDetailComponent,
    PlayComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    YtRoutingModule,
    HttpClientModule,
    GoogleApiModule.forRoot({
      provide: NG_GAPI_CONFIG,
      useValue: gapiClientConfig
    }),
    BrowserAnimationsModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatCardModule,
    MatListModule,
    MatInputModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTabsModule,
    MatChipsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
