import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

import { GoogleAuthService } from "ng-gapi";
import { StorageService } from 'src/app/storage.service';
import { YtService } from 'src/app/yt.service';
import { FakeYtService } from 'src/test-files/yt.service.fake';
import { ChannelListResponse } from 'src/app/channelListResponse';
import { Channel } from 'src/app/channel';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let testedAuthService: AuthService;
  let googleAuthServiceSpy: jasmine.SpyObj<GoogleAuthService>;
  let googleAuthSpy: jasmine.SpyObj<gapi.auth2.GoogleAuth>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  let ytServiceFake: FakeYtService;
  let stubAccessToken: string = 'stub token';
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])
    googleAuthServiceSpy = jasmine.createSpyObj('GoogleAuthService', ['getAuth']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', ['getAuthToken', 'setAuthToken', 'deleteAuthToken', 'deleteChannelTitle']);
    ytServiceFake = new FakeYtService();

    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      providers: [
        AuthService,
        {
          provide: GoogleAuthService,
          useValue: googleAuthServiceSpy
        },
        {
          provide: StorageService,
          useValue: storageServiceSpy
        },
        {
          provide: YtService,
          useValue: ytServiceFake as YtService
        },
        {
          provide: Router,
          useValue: routerSpy
        }
      ]
    });
    
    testedAuthService = TestBed.get(AuthService);
  });

  describe('signIn', () => {
    let googleUserSpy: jasmine.SpyObj<gapi.auth2.GoogleUser>;

    beforeEach(() => {
      googleUserSpy = jasmine.createSpyObj('gapi.auth2.GoogleUser', ['getAuthResponse']);
      googleUserSpy.getAuthResponse.and.returnValue({
        access_token: stubAccessToken
      });

      googleAuthSpy = jasmine.createSpyObj('gapi.auth2.GoogleAuth', ['signIn']);
      googleAuthSpy.signIn.and.returnValue(new Promise((resolve) => {
        resolve(googleUserSpy);
      }));

      googleAuthServiceSpy.getAuth.and.returnValue(new Observable((subscriber) => {
        subscriber.next(googleAuthSpy);
        subscriber.complete();
      }));
    });

    it('puts token in storage', fakeAsync(() => {
      spyOn(ytServiceFake, 'getCurrentChannel').and.returnValue(new Observable(() => {}));
      spyOnProperty(ytServiceFake, 'lastChannelTitle');

      testedAuthService.signIn();
      tick();
      expect(storageServiceSpy.setAuthToken).toHaveBeenCalled();
    }));

    it('asks ytService for current channel, updates lastChannelTitle with it', fakeAsync(() => {
      let stubTitle = 'stub';
      
      spyOn(ytServiceFake, 'getCurrentChannel').and.returnValue(new Observable<ChannelListResponse>((subscriber) => {
        let channel: Channel = new Channel();
        channel.snippet = Object.assign({title: stubTitle}, channel.snippet);
        let response: ChannelListResponse = new ChannelListResponse();
        response.items = [channel];
        subscriber.next(response);
      }));

      let setSpy = spyOnProperty(ytServiceFake, 'lastChannelTitle', 'set');

      testedAuthService.signIn();
      tick();
      expect(setSpy).toHaveBeenCalled();
    }));
  });

  describe('signOut', () => {
    beforeEach(() => {
      googleAuthSpy = jasmine.createSpyObj('gapi.auth2.GoogleAuth', ['signOut']);
      googleAuthSpy.signOut.and.returnValue(new Promise((resolve) => {
        resolve();
      }));

      googleAuthServiceSpy.getAuth.and.returnValue(new Observable((subscriber) => {
        subscriber.next(googleAuthSpy);
        subscriber.complete();
      }));
    });

    it('deletes token', fakeAsync(() => {
      testedAuthService.signOut();
      tick();
      expect(storageServiceSpy.deleteAuthToken).toHaveBeenCalled();
    }));

    it('deletes channel title', fakeAsync(() => {
      testedAuthService.signOut();
      tick();
      expect(storageServiceSpy.deleteChannelTitle).toHaveBeenCalled();
    }));
  });

  describe('isSignedIn', () => {
    it('returns true if storage has an auth token, otherwise false', () => {
      storageServiceSpy.getAuthToken.and.returnValue('stub');
      expect(testedAuthService.isSignedIn()).toBeTruthy();
      storageServiceSpy.getAuthToken.and.throwError("Error");
      expect(testedAuthService.isSignedIn()).toBeFalsy();
    });
  });
});
