import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

import { AuthComponent } from './auth.component';
import { AuthService } from '../auth.service';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let stubAuthService;

  beforeEach(async(() => {
    stubAuthService = new AuthServiceStub();
    spyOn(stubAuthService, 'isSignedIn').and.returnValue(false);

    TestBed.configureTestingModule({
      declarations: [AuthComponent],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatToolbarModule,
        MatCardModule
      ],
      providers: [
        {
          provide: AuthService,
          useValue: stubAuthService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('is created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    describe('sets the value of IS_SIGNED_IN to the return value of authService.isSignedIn()', () => {
      it('when isSignedIn() returns false', () => {
        stubAuthService.isSignedIn.and.returnValue(false);
        component.ngOnInit;
        expect(AuthServiceStub.IS_SIGNED_IN).toBeFalsy();
      });

      it('when isSignedIn() returns true', () => {
        stubAuthService.isSignedIn.and.returnValue(true);
        component.ngOnInit;
        expect(AuthServiceStub.IS_SIGNED_IN).toBeTruthy;
      });
    });
  });

  describe('signIn', () => {
    it('calls the authService signIn', () => { 
      spyOn(stubAuthService, 'signIn');
      component.signIn();
      expect(stubAuthService.signIn).toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('calls the authService signOut', () => {
      spyOn(stubAuthService, 'signOut');
      component.signOut();
      expect(stubAuthService.signOut).toHaveBeenCalled();
    });
  });

  describe('isSignedIn', () => {
    it('returns the value of IS_SIGNED_IN', () => {
      AuthService.IS_SIGNED_IN = true;
      expect(component.isSignedIn()).toEqual(true);
      AuthService.IS_SIGNED_IN = false;
      expect(component.isSignedIn()).toEqual(false);
    });
  });
});


class AuthServiceStub extends AuthService {

  constructor() {
    super(null, null, null);
  }

  public static IS_SIGNED_IN: boolean;

  public signIn(): void {}

  public signOut(): void {}

  public isSignedIn(): boolean {
    return null;
  }
}
