//from ng-gapi (rubenCodeforges) docs

import { Injectable } from '@angular/core';

import { GoogleAuthService } from "ng-gapi";
import GoogleUser = gapi.auth2.GoogleUser;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    public static SESSION_STORAGE_KEY: string = 'accessToken';
    private user: GoogleUser;

    constructor(private googleAuth: GoogleAuthService) { }

    public getToken(): string {

        let token: string = sessionStorage.getItem(AuthService.SESSION_STORAGE_KEY);
        if (!token) {

            throw new Error("no token set, authentication required"); //throws error the first time; should be ok after (until token expiration) since the token is stored in YtService for requests

        }
        return sessionStorage.getItem(AuthService.SESSION_STORAGE_KEY);

    }

    public signIn(): void {

        this.googleAuth.getAuth().subscribe((auth) => { auth.signIn().then(res => this.signInSuccessHandler(res)); });

    }

    private signInSuccessHandler(res: GoogleUser) {

        this.user = res;
        sessionStorage.setItem(AuthService.SESSION_STORAGE_KEY, res.getAuthResponse().access_token);

    }

}
