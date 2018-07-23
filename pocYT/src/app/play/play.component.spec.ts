import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PlayComponent } from './play.component';
import { ActivatedRouteStub } from '../../test-files/activated-route.stub';
import { SafePipe } from '../safe.pipe';

describe('PlayComponent', () => {
  let component: PlayComponent;
  let fixture: ComponentFixture<PlayComponent>;
  let routeStub: ActivatedRouteStub;
  let locationSpy;

  describe('(unit tests)', () => {
    beforeEach(async(() => {
      routeStub = new ActivatedRouteStub();
      routeStub.paramMapValueToReturn = 'initial_stub';
      locationSpy = jasmine.createSpyObj('Location', ['back']);
  
      TestBed.configureTestingModule({
        declarations: [ PlayComponent, SafePipe ],
        schemas: [ NO_ERRORS_SCHEMA ],
        imports: [ RouterTestingModule ],
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
      });
  
      fixture = TestBed.overrideComponent(PlayComponent, {
        set: {
          template: '<div></div>'
        }
      }).createComponent(PlayComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }));

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

  describe('(DOM)', () => {
    let appElement: HTMLElement;

    beforeEach(async(() => {
      routeStub = new ActivatedRouteStub();
      routeStub.paramMapValueToReturn = 'initial_stub';
      locationSpy = jasmine.createSpyObj('Location', ['back']);
  
      TestBed.configureTestingModule({
        declarations: [ PlayComponent, SafePipe ],
        schemas: [ NO_ERRORS_SCHEMA ],
        imports: [ RouterTestingModule ],
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

      appElement = fixture.nativeElement;
    }));

    it('creates a toolbar with appropriate text', () => {
      let toolbar = appElement.querySelector('mat-toolbar');

      expect(toolbar.innerHTML).toContain('Watch Playlist');
    });

    it('populates iframe with embedUrl and fixed dimensions', () => {
      let iframe = appElement.querySelector('iframe');

      expect(iframe.height).toEqual('315');
      expect(iframe.width).toEqual('560');
      expect(iframe.src).toEqual('https://www.youtube.com/embed/videoseries?list=initial_stub&autoplay=1&loop=1');
    });

    it('creates the Go Back button', () => {
      let goBackButton = appElement.querySelector('button');

      expect(goBackButton).toBeTruthy();
      expect(goBackButton.innerHTML).toContain('Go Back');
    });

    it('triggers goBack when corresponding button is clicked', () => {
      let goBackButton = appElement.querySelector('button');
      spyOn(component, 'goBack');

      goBackButton.click();
      expect(component.goBack).toHaveBeenCalled();
    });
  });
});
