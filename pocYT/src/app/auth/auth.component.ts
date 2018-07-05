import { Component, OnInit } from '@angular/core';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit() {

    AuthService.IS_SIGNED_IN = this.authService.isSignedIn();

  }

  signIn(): void {

    this.authService.signIn();

  }

  signOut(): void {

    this.authService.signOut();

  }

  isSignedIn(): boolean {

    return AuthService.IS_SIGNED_IN;

  }

}
