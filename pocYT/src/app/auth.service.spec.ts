import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

import { GoogleAuthService } from "ng-gapi";

describe('AuthService', () => {
  let testedAuthService: AuthService;
  let googleAuthServiceSpy: jasmine.SpyObj<GoogleAuthService>;
  let googleAuthSpy: jasmine.SpyObj<gapi.auth2.GoogleAuth>;
  let mockStorage;
  let stubAccessToken: string = 'stub token';

  // Mocks sessionStorage
  function setUpStorageSpies() {
    let store = {};
    mockStorage = {
      getItem: (key: string): string => {
        return store[key];
      },
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string): void => {
        store[key] = null;
      }
    };
    spyOn(sessionStorage, 'getItem').and.callFake(mockStorage.getItem);
    spyOn(sessionStorage, 'setItem').and.callFake(mockStorage.setItem);
    spyOn(sessionStorage, 'removeItem').and.callFake(mockStorage.removeItem);
  }
  
  function setUpGoogleAuthSpies() {
    googleAuthServiceSpy = jasmine.createSpyObj('GoogleAuthService', ['getAuth']);
    googleAuthSpy = jasmine.createSpyObj('GoogleAuth', ['signIn', 'signOut']);

    function subscription(observer) {
      observer.next(googleAuthSpy);
      observer.complete();
    }

    googleAuthServiceSpy.getAuth.and.callFake(() => {
      return new Observable<gapi.auth2.GoogleAuth>(subscription);
    });

    googleAuthSpy.signIn.and.callFake(() => {
      return new Promise(() => {
        sessionStorage.setItem(AuthService.SESSION_STORAGE_KEY, 'test_token');
      });
    });

    googleAuthSpy.signOut.and.callFake(() => {
      return new Promise(() => {
        sessionStorage.removeItem(AuthService.SESSION_STORAGE_KEY);
      });
    });
  }

  function setUpTestingModule() {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      providers: [
        AuthService,
        {
          provide: GoogleAuthService,
          useValue: googleAuthServiceSpy
        }
      ]
    });
  }

  beforeEach(() => {
    setUpStorageSpies();
    setUpGoogleAuthSpies();
    setUpTestingModule();
    testedAuthService = TestBed.get(AuthService);
  });

  describe('getToken', () => {
    it('throws error if no token has been set', () => {
      expect(testedAuthService.getToken).toThrowError("No token set; authentication required.");
    });
  
    it('returns the token if it has been set', () => {
      let testVal = 'test val';
      sessionStorage.setItem(AuthService.SESSION_STORAGE_KEY, testVal);
      expect(testedAuthService.getToken()).toEqual(testVal);
    });
  });

  describe('signIn', () => {
    it('calls getAuth and the googleAuth signIn', async () => {
      testedAuthService.signIn();
      expect(googleAuthServiceSpy.getAuth).toHaveBeenCalled();
      expect(googleAuthSpy.signIn).toHaveBeenCalled();
      expect(testedAuthService.isSignedIn()).toBe(true);
    });
  });

  describe('signOut', () => {
    it('calls getAuth and the googleAuth signOut', async () => {
      testedAuthService.signOut();
      expect(googleAuthServiceSpy.getAuth).toHaveBeenCalled();
      expect(googleAuthSpy.signOut).toHaveBeenCalled();
      expect(testedAuthService.isSignedIn()).toBe(false);
    });
  });

  describe('isSignedIn', () => {
    it('returns true if the token exists', () => {
      sessionStorage.setItem(AuthService.SESSION_STORAGE_KEY, 'token');
      expect(testedAuthService.isSignedIn()).toBe(true);
    });

    it('returns false if the token does not exist', () => {
      spyOn(testedAuthService, 'getToken').and.callFake(() => {
        throw new Error('No token set; authentication required.');
      });
      expect(testedAuthService.isSignedIn()).toBe(false);
    });
  });
});
