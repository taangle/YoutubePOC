//mostly from ng-gapi (rubenCodeforges) docs

import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { GoogleAuthService } from "ng-gapi";
import GoogleUser = gapi.auth2.GoogleUser;
import { YtService } from 'src/app/yt.service';
import { StorageService } from 'src/app/storage.service';
import { ChannelListResponse } from 'src/app/channelListResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private googleAuthService: GoogleAuthService, private ngZone: NgZone, private router: Router, private ytService: YtService, private storage: StorageService) { }

  public signIn(): void {

    this.googleAuthService.getAuth().subscribe(
      (googleAuth: gapi.auth2.GoogleAuth) => {
        googleAuth.signIn().then((user: GoogleUser) => this.signInSuccessHandler(user), error => this.handleAuthError(error));
      }, error => {
        this.handleAuthError(error);
      }
    );

  }

  public signOut(): void {

    this.googleAuthService.getAuth().subscribe((auth) => {
      auth.signOut().then(() => this.signOutSuccessHandler(), error => this.handleAuthError(error));
    }, error => this.handleAuthError(error));

  }

  //checks if access token exists; if it does, user is signed-in, otherwise, user is signed-out
  public isSignedIn(): boolean {

    try {
      
      this.storage.getAuthToken();
      return true;

    } catch (Error) {

      return false;

    }

  }

  private signInSuccessHandler(user: GoogleUser) {

    this.storage.setAuthToken(user.getAuthResponse().access_token);
    this.ytService.getCurrentChannel().subscribe((response: ChannelListResponse) => {
      this.ytService.lastChannelTitle = response.items[0].snippet.title;
      //NgZone is used so that userDetailComponent.ngOnInit is called when redirect occurs
      this.ngZone.run(() => this.router.navigate(['/user']));
    });

  }

  private signOutSuccessHandler() {

    this.storage.deleteAuthToken();
    this.ytService.deleteChannelTitle();
    //NgZone is used so that ytComponent.ngOnInit is called when redirect occurss
    this.ngZone.run(() => this.router.navigate(['/playlist']));

  }

  //just prints error since one should only occur when user closes sign-in pop-up or Google has some error on their end
  private handleAuthError(error: any) {

    console.error(error);

  }

}
