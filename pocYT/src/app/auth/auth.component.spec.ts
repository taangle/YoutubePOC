import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { NO_ERRORS_SCHEMA } from '@angular/core';

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
      schemas: [ NO_ERRORS_SCHEMA ],
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

  describe('(unit tests)', () => {
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

  describe('(DOM)', () => {
    let appElement: HTMLElement;

    beforeEach(() => {
      appElement = fixture.nativeElement;
    });

    it('creates toolbar with appropriate text', () => {
      let toolbar = appElement.querySelector('mat-toolbar');

      expect(toolbar.innerHTML).toContain('Sign In/Out');
    });

    it('generates card with header, content, actions sections', () => {
      let card = appElement.querySelector('mat-card');
      let cardHeader = card.querySelector('mat-card-header');
      let cardContent = card.querySelector('mat-card-content');
      let cardActions = card.querySelector('mat-card-actions');

      expect(card).toBeTruthy();
      expect(cardHeader).toBeTruthy();
      expect(cardContent).toBeTruthy();
      expect(cardActions).toBeTruthy();
    });

    it('generates card with header with appropriate title', () => {
      let cardHeader = appElement.querySelector('mat-card').querySelector('mat-card-header');
      let cardHeaderTitle = cardHeader.querySelector('mat-card-title');

      expect(cardHeaderTitle.innerHTML).toContain('Current Status:');
      expect(cardHeaderTitle.innerHTML).toContain('Signed Out');
    });

    it('displays correct sign-in status', () => {
      let cardHeaderTitle = appElement.querySelector('mat-card').querySelector('mat-card-header').querySelector('mat-card-title');

      AuthService.IS_SIGNED_IN = true;
      fixture.detectChanges();
      expect(cardHeaderTitle.innerHTML).toContain('Signed In');

      AuthService.IS_SIGNED_IN = false;
      fixture.detectChanges();
      expect(cardHeaderTitle.innerHTML).toContain('Signed Out');
    });

    it('generates card with appropriate content', () => {
      let cardContent = appElement.querySelector('mat-card').querySelector('mat-card-content');
      let cardContentFeatureList = cardContent.querySelector('ul');

      expect(cardContent.innerHTML).toContain('Please sign in with a Google account');
      expect(cardContentFeatureList).toBeTruthy();
    });

    it('generates card with action buttons', () => {
      let cardActions = appElement.querySelector('mat-card').querySelector('mat-card-actions');
      let cardActionsButtons = cardActions.querySelectorAll('button');

      expect(cardActionsButtons.length).toEqual(2);
      expect(cardActionsButtons[0].innerHTML).toContain('SIGN IN');
      expect(cardActionsButtons[1].innerHTML).toContain('SIGN OUT');
    });

    it('triggers signIn when corresponding button is clicked', () => {
      let cardActionsButtons = appElement.querySelector('mat-card').querySelector('mat-card-actions').querySelectorAll('button');
      let signInButton = cardActionsButtons[0];
      spyOn(component, 'signIn');

      signInButton.click();
      expect(component.signIn).toHaveBeenCalled();
    });

    it('triggers signOut when corresponding button is clicked', () => {
      let cardActionsButtons = appElement.querySelector('mat-card').querySelector('mat-card-actions').querySelectorAll('button');
      let signOutButton = cardActionsButtons[1];
      spyOn(component, 'signOut');

      signOutButton.click();
      expect(component.signOut).toHaveBeenCalled();
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
