import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let appElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      imports: [
        FormsModule,
        RouterTestingModule 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    appElement = fixture.nativeElement;
  }));

  it(`has as title 'YouTube POC'`, async(() => {
    expect(component.title).toEqual('YouTube POC');
  }));

  it('creates toolbar and displays title', () => {
    let toolbar = appElement.querySelector('mat-toolbar');

    expect(toolbar.innerHTML).toContain(component.title);
  });

  it('creates nav tab group with three links', () => {
    let nav = appElement.querySelector('nav');
    let navLinks = nav.querySelectorAll('a');
    let playlistLink = navLinks[0];
    let userLink = navLinks[1];
    let loginLink = navLinks[2];

    expect(nav).toBeTruthy();
    expect(playlistLink.innerHTML).toContain('Playlist View');
    expect(playlistLink.href).toContain('/playlist');
    expect(userLink.innerHTML).toContain('User Overview');
    expect(userLink.href).toContain('/user');
    expect(loginLink.innerHTML).toContain('Sign In/Out');
    expect(loginLink.href).toContain('/login');
  });

  it('creates a router outlet', async(() => {
    let routerOutlet = appElement.querySelector('router-outlet');

    expect(routerOutlet).toBeTruthy();
  }));
});
