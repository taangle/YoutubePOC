import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

import { PlayComponent } from './play.component';
import { ActivatedRouteStub } from '../../test-files/activated-route.stub';
import { SafePipe } from '../safe.pipe';

describe('PlayComponent', () => {
  let component: PlayComponent;
  let fixture: ComponentFixture<PlayComponent>;
  let routeStub: ActivatedRouteStub;
  let locationSpy;

  beforeEach(async(() => {
    routeStub = new ActivatedRouteStub();
    routeStub.paramMapValueToReturn = 'initial_stub';
    locationSpy = jasmine.createSpyObj('Location', ['back']);

    TestBed.configureTestingModule({
      declarations: [ PlayComponent, SafePipe ],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatToolbarModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: routeStub 
        },
        {
          provide: Location,
          useValue: locationSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('is created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('populates embedUrl using the value at \'id\'', () => {
      let stubVal = 'ngOnInit_stub';
      routeStub.paramMapValueToReturn = stubVal;
      component.ngOnInit();
      expect(component.embedUrl).toEqual('https://www.youtube.com/embed/videoseries?list=' + stubVal + '&autoplay=1&loop=1');
    });
  });

  describe('goBack', () => {
    it('asks location to go back', () => {
      component.goBack();
      expect(locationSpy.back).toHaveBeenCalled();
    });
  });
});
