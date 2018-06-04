//mostly from ng-gapi (rubenCodeforges) docs

import { Injectable } from '@angular/core';

import { GoogleAuthService } from "ng-gapi";
import GoogleUser = gapi.auth2.GoogleUser;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    public static SESSION_STORAGE_KEY: string = 'accessToken'; //currently, can't tell when token expires
    public static IS_SIGNED_IN: boolean = false; //signed-in status
    private user: GoogleUser = null;

    constructor(private googleAuth: GoogleAuthService) { }

    public getToken(): string {

        let token: string = sessionStorage.getItem(AuthService.SESSION_STORAGE_KEY);
        if (!token) {

            throw new Error("No token set; authentication required."); //throws error for signed-out user

        }
        return sessionStorage.getItem(AuthService.SESSION_STORAGE_KEY);

    }

    public signIn(): void {

        this.googleAuth.getAuth().subscribe((auth) => {
            auth.signIn().then(res => this.signInSuccessHandler(res));
        }, error => this.handleAuthError(error));

    }

    public signOut(): void {

        this.googleAuth.getAuth().subscribe((auth) => {
            auth.signOut().then(() => this.signOutSuccessHandler());
        }, error => this.handleAuthError(error));

    }

    //checks if access token exists; if it does, user is signed-in, otherwise, user is signed-out
    public isSignedIn(): boolean {

        try {

            this.getToken();
            return true;

        } catch (Error) {

            return false;

        }

    }

    private signInSuccessHandler(res: GoogleUser) {

        this.user = res;
        sessionStorage.setItem(AuthService.SESSION_STORAGE_KEY, res.getAuthResponse().access_token);
        AuthService.IS_SIGNED_IN = this.isSignedIn(); //should become true

    }

    private signOutSuccessHandler() {

        this.user = null;
        sessionStorage.removeItem(AuthService.SESSION_STORAGE_KEY);
        AuthService.IS_SIGNED_IN = this.isSignedIn(); //should become false

    }

    //unsure what form authentication error takes
    private handleAuthError(error: any) {

        console.error(error);

    }

}
