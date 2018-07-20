import { routes } from './yt-routing.module';
import { Location } from "@angular/common";
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { GoogleAuthService } from "ng-gapi";

import { AppComponent } from 'src/app/app.component';
import { AuthComponent } from 'src/app/auth/auth.component';
import { PlayComponent } from 'src/app/play/play.component';
import { UserDetailComponent } from 'src/app/user-detail/user-detail.component';
import { VideoDetailComponent } from 'src/app/video-detail/video-detail.component';
import { YtComponent } from 'src/app/yt/yt.component';
import { SafePipe } from 'src/app/safe.pipe';

describe('YtRoutingModule', () => {
  let location: Location;
  let router: Router;
  let fixture;
  let googleAuthServiceSpy: jasmine.SpyObj<GoogleAuthService>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        HttpClientTestingModule, //if you don't provide this in some way, a StaticInjectorError is thrown
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
      declarations: [
        AppComponent,
        AuthComponent,
        PlayComponent,
        UserDetailComponent,
        VideoDetailComponent,
        YtComponent,
        SafePipe
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
      imports: [
        RouterTestingModule.withRoutes(routes),
        HttpClientTestingModule, //if you don't provide this in some way, a StaticInjectorError is thrown
      ],
      providers: [
        {
          //if you don't provide this in some way, a StaticInjectorError is thrown
          provide: GoogleAuthService,
          useValue: googleAuthServiceSpy
        }
      ]
    });

    router = TestBed.get(Router);
    location = TestBed.get(Location);
    fixture = TestBed.createComponent(AppComponent);
    router.initialNavigation();
  }));

  it('redirects \'\' to /login', fakeAsync(() => {
    router.navigate(['']).then(() => expect(location.path()).toBe('/login'), () => fail('Failed to re-route to /login'));
    tick(); //just in case, not necessary here
  }));

  it('directs \'playlist\' to /playlist', fakeAsync(() => {
    router.navigate(['playlist']).then(() => expect(location.path()).toBe('/playlist'), () => fail('Failed to route to /playlist'));
    tick(); //if you don't have this, an error will be thrown about leftover timer(s) in the queue (caused by NgZone)
  }));

  it('directs \'login\' to /login', fakeAsync(() => {
    router.navigate(['login']).then(() => expect(location.path()).toBe('/login'), () => fail('Failed to route to /login'));
    tick(); //just in case, not necessary here
  }));

  it('redirects \'video/:id\' to /video/:id', fakeAsync(() => {
    let id: string = '123';
    router.navigate(['video/' + id]).then(() => expect(location.path()).toBe('/video/' + id), () => fail('Failed to route to /video/' + id));
    tick(); //if you don't have this, an error will be thrown about leftover timer(s) in the queue (caused by NgZone)
    id = 'abc';
    router.navigate(['video/' + id]).then(() => expect(location.path()).toBe('/video/' + id), () => fail('Failed to route to /video/' + id));
    tick();
  }));

  it('directs \'user\' to /user', fakeAsync(() => {
    router.navigate(['user']).then(() => expect(location.path()).toBe('/user'), () => fail('Failed to route to /user'));
    tick(); //if you don't have this, an error will be thrown about leftover timer(s) in the queue (caused by NgZone)
  }));

  it('redirects \'play/:id\' to /play/:id', fakeAsync(() => {
    let id: string = '123';
    router.navigate(['play/' + id]).then(() => expect(location.path()).toBe('/play/' + id), () => fail('Failed to route to /play/' + id));
    tick(); //if you don't have this, an error will be thrown about leftover timer(s) in the queue (caused by NgZone)
    id = 'abc';
    router.navigate(['play/' + id]).then(() => expect(location.path()).toBe('/play/' + id), () => fail('Failed to route to /play/' + id));
    tick();
  }));

  it('redirects \'**\' (non-existent route) to /login', fakeAsync(() => {
    let wrongRoute = '**';
    router.navigate([wrongRoute]).then(() => expect(location.path()).toBe('/login'), () => fail('Failed to re-route to /login'));
    tick(); //just in case, not necessary here
    wrongRoute = 'wrongroute';
    router.navigate([wrongRoute]).then(() => expect(location.path()).toBe('/login'), () => fail('Failed to re-route to /login'));
    tick(); //just in case, not necessary here
  }));
});
