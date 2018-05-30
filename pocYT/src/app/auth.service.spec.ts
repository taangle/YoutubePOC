import { TestBed, inject } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { GoogleAuthService } from "ng-gapi";
import { Observable } from 'rxjs';

describe('AuthService', () => {
  let authService: AuthService;
  let googleAuthServiceSpy: jasmine.SpyObj<GoogleAuthService>;
  let googleAuthSpy;
  let store;
  let mockStorage;

  function setUpStorageSpies() {
    store = {};
    mockStorage = {
      getItem: (key: string): string => {
        return store[key];
      },
      setItem: (key: string, value: string) => {
        store[key] = value;
      }
    };
    spyOn(sessionStorage, 'getItem').and.callFake(mockStorage.getItem);
    spyOn(sessionStorage, 'setItem').and.callFake(mockStorage.setItem);
  }
  
  function setUpGoogleAuthSpies() {
    googleAuthServiceSpy = jasmine.createSpyObj('GoogleAuthService', ['getAuth']);
    googleAuthSpy = jasmine.createSpyObj('GoogleAuth', ['signIn']);
    function subscriber(observer) {
      observer.next(googleAuthSpy);
    }
    googleAuthServiceSpy.getAuth.and.callFake(() => {
      return new Observable(subscriber);
    });
  }

  beforeEach(() => {
    // TestBed.configureTestingModule({ providers: [AuthService] });
    setUpStorageSpies();
    setUpGoogleAuthSpies();
    authService = new AuthService(googleAuthServiceSpy);
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  describe('getToken', () => {
    it('should throw error if no taken has been set', () => {
      expect(authService.getToken).toThrowError("No token set; authentication required.");
    });
  
    it('should return the token if it has been set', () => {
      let testKey = AuthService.SESSION_STORAGE_KEY;
      let testVal = "test val";
      sessionStorage.setItem(testKey, testVal);
      expect(authService.getToken()).toEqual(testVal);
    });
  });

  describe('signIn', () => {
    it('should call getAuth once', () => {
      authService.signIn();
      expect(googleAuthServiceSpy.getAuth).toHaveBeenCalledTimes(1);
    });

    xit('*PENDING* should call the signIn on GoogleAuth', () => {
      authService.signIn();
      expect(googleAuthSpy.signIn).toHaveBeenCalled();
    })
  });
});
