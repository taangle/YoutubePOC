import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

    constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {

      AuthService.IS_SIGNED_IN = this.authService.isSignedIn();

  }

  signIn(): void {

      this.authService.signIn();
      this.redirect();

  }

  signOut(): void {

      this.authService.signOut();
      this.redirect();

  }

  isSignedIn(): boolean {

      return AuthService.IS_SIGNED_IN;

  }

  redirect(): void {

      this.router.navigate(['/playlist']);

  }

}
