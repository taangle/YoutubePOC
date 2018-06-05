import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthComponent } from './auth.component';
import { AuthService } from '../auth.service';
import { Location } from '@angular/common';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let locationSpy;
  let authServiceSpy;

  beforeEach(async(() => {
    locationSpy = jasmine.createSpyObj('Location', ['back']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signIn', 'signOut', 'isSignedIn']);
    authServiceSpy.isSignedIn.and.returnValue(false);

    TestBed.configureTestingModule({
      declarations: [ AuthComponent ],
      providers: [
        {
          provide: Location,
          useValue: locationSpy
        },
        {
          provide: AuthService,
          useValue: authServiceSpy
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is created', () => {
    expect(component).toBeTruthy();
  });

  describe('signIn', () => {
    it('calls the authService signIn', () => { 
      component.signIn();
      expect(authServiceSpy.signIn).toHaveBeenCalled();
    });

    it('calls goBack', () => {
      spyOn(component, 'goBack');
      component.signIn();
      expect(component.goBack).toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('calls the authService signOut', () => {
      component.signOut();
      expect(authServiceSpy.signOut).toHaveBeenCalled();
    });

    it('calls goBack', () => {
      spyOn(component, 'goBack');
      component.signOut();
      expect(component.goBack).toHaveBeenCalled();
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
