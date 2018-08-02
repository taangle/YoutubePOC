//mostly from ng-gapi (rubenCodeforges) docs

import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { GoogleAuthService } from "ng-gapi";
import GoogleUser = gapi.auth2.GoogleUser;
import { YtService } from 'src/app/yt.service';
import { StorageService } from 'src/app/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private googleAuthService: GoogleAuthService, private ngZone: NgZone, private router: Router, private ytService: YtService, private storage: StorageService) { }

  public signIn(): void {

    this.googleAuthService.getAuth().subscribe((googleAuth: gapi.auth2.GoogleAuth) => {
      googleAuth.signIn().then(user => this.signInSuccessHandler(user), error => this.handleAuthError(error));
    }, error => this.handleAuthError(error));

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

    console.log("~~signInHandler: " + user.getId());

    this.storage.setAuthToken(user.getAuthResponse().access_token);
    this.ytService.setChannelTitle(); 
    //redirects to user view page; this is done here so that the redirect happens after the user completely signs in (no early redirect)
    //and since only authComponent will call authService.signIn/signOut
    //NgZone is used so that userDetailComponent.ngOnInit is called when redirect occurs; otherwise, page won't update on redirect with
    //user's playlists (something to do with services not interacting with components that way)
    this.ngZone.run(() => this.router.navigate(['/user']));

  }

  private signOutSuccessHandler() {

    this.storage.deleteAuthToken();
    this.ytService.deleteChannelTitle();
    //redirects to user view page; this is done here so that the redirect happens after the user completely signs in (no early redirect)
    //and since only authComponent will call authService.signIn/signOut
    //NgZone is used so that ytComponent.ngOnInit is called when redirect occurs; otherwise, page won't update on redirect with
    //last-viewed playlist (something to do with services not interacting with components that way)
    this.ngZone.run(() => this.router.navigate(['/playlist']));

  }

  //just prints error since one should only occur when user closes sign-in pop-up or Google has some error on their end
  private handleAuthError(error: any) {

    console.error(error);

  }

}
