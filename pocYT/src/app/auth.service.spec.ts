import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { GoogleAuthService } from "ng-gapi";

describe('AuthService', () => {
    let testedAuthService: AuthService;
    let googleAuthServiceSpy: jasmine.SpyObj<GoogleAuthService>;
    let googleAuthSpy;
    let mockStorage;
    let stubAccessToken = 'stub token';

    // Mocks sessionStorage
    function setUpStorageSpies() {
        let store = {};
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
        googleAuthSpy = jasmine.createSpyObj('GoogleAuth', ['signIn', 'then']);
        function subscription(observer) {
            observer.next(googleAuthSpy);
            observer.complete();
        }
        googleAuthServiceSpy.getAuth.and.callFake(() => {
            return new Observable(subscription);
        });
        googleAuthSpy.signIn.and.callFake(() => {
            return {
                getAuthResponse: () => {
                    return {
                        access_token: stubAccessToken
                    };
                }
            }
        });
    }

    function setUpTestingModule() {
        TestBed.configureTestingModule({
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

    it('is created', () => {
        expect(testedAuthService).toBeTruthy();
    });

    describe('getToken', () => {
        it('throws error if no taken has been set', () => {
            expect(testedAuthService.getToken).toThrowError("No token set; authentication required.");
        });

        it('returns the token if it has been set', () => {
            let testVal = "test val";
            sessionStorage.setItem(AuthService.SESSION_STORAGE_KEY, testVal);
            expect(testedAuthService.getToken()).toEqual(testVal);
        });
    });

    describe('signIn', () => {
        xit('*PENDING* calls getAuth and the googleAuth signIn', async () => {
            // These should be separate tests, but I had problems
            //the "then" that gets called might be related to to the problem somehow
            testedAuthService.signIn();
            expect(googleAuthServiceSpy.getAuth).toHaveBeenCalled();
            await expect(googleAuthSpy.signIn).toHaveBeenCalled();
            //await expect(sessionStorage.getItem(AuthService.SESSION_STORAGE_KEY)).toEqual(stubAccessToken);
        });

        xit('*PENDING* calls the signIn on GoogleAuth', () => {
            // Something changes that makes calling signIn an error
            testedAuthService.signIn();
            expect(googleAuthSpy.signIn).toHaveBeenCalled();
        });
    });
});