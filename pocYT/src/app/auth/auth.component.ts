import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

    constructor(private authService: AuthService, private location: Location) { }

  ngOnInit() {

      AuthService.IS_SIGNED_IN = this.authService.isSignedIn();

  }

  signIn(): void {

      this.authService.signIn();
      this.goBack();

  }

  signOut(): void {

      this.authService.signOut();
      this.goBack();

  }

  isSignedIn(): boolean {

      return AuthService.IS_SIGNED_IN;

  }

  goBack(): void {

      this.location.back();

  }

}
