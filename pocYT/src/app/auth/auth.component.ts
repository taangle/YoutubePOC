import { Component, OnInit } from '@angular/core';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {

  constructor(private authService: AuthService) { }

  signIn(): void {

    this.authService.signIn();

  }

  signOut(): void {

    this.authService.signOut();

  }

  isSignedIn(): boolean {

    return this.authService.isSignedIn();

  }

}
