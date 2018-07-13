import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        FormsModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatMenuModule,
        MatToolbarModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  }));

  it('creates the app', async(() => {
    expect(component).toBeTruthy();
  }));

  it(`has as title 'YouTube POC'`, async(() => {
    expect(component.title).toEqual('YouTube POC');
  }));

  it('creates toolbar and displays title', () => {
    let appElement: HTMLElement = fixture.nativeElement;
    let toolbar = appElement.querySelector('mat-toolbar');

    expect(toolbar.innerHTML).toContain(component.title);
  });

  it('creates menu and menu button', () => {
    let appElement: HTMLElement = fixture.nativeElement;
    let menu = appElement.querySelector('mat-menu');
    let menuButton = appElement.querySelector('button');

    expect(menu).toBeTruthy();
    expect(menuButton.innerHTML).toContain('Menu');
  });

  it('creates a router outlet', async(() => {
    let appElement: HTMLElement = fixture.nativeElement;
    let routerOutlet = appElement.querySelector('router-outlet');

    expect(routerOutlet).toBeTruthy();
  }));
});
