import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';

import { VideoDetailComponent } from './video-detail.component';
import { YtService } from '../yt.service';
import { PlaylistItem } from '../playlistItem';
import { PlaylistItemListResponse } from '../playlistItemListResponse';
import { ActivatedRouteStub } from 'src/test-files/activated-route.stub';
import { ActivatedRoute } from '@angular/router';
import { FakeYtService } from 'src/test-files/yt.service.fake';
import { fakeAsync, tick } from '@angular/core/testing';

describe('VideoDetailComponent', () => {
  let component: VideoDetailComponent;
  let fixture: ComponentFixture<VideoDetailComponent>;
  let routeStub: ActivatedRouteStub;
  let locationSpy;
  let ytServiceFake: FakeYtService;

  beforeEach(async(() => {
    ytServiceFake = new FakeYtService();
    routeStub = new ActivatedRouteStub();
    routeStub.paramMapValueToReturn = 'initial_stub';
    locationSpy = jasmine.createSpyObj('Location', ['back']);

    TestBed.configureTestingModule({
      declarations: [VideoDetailComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: YtService,
          useValue: ytServiceFake
        },
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('calls its own getPlaylistItem', () => {
      spyOn(component, 'getPlaylistItem');
      component.ngOnInit();
      expect(component.getPlaylistItem).toHaveBeenCalled();
    });
  });

  describe('getPlaylistItem', () => {
    it('asks ytService for playlist item by id, populates \'item\' with it', fakeAsync(() => {
      let stubId = 'getPlaylistItem_stub_id';
      routeStub.paramMapValueToReturn = stubId;
      let itemToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
      ytServiceFake.playlistItemToReturn = itemToReturn;
      spyOn(ytServiceFake, 'getPlaylistItem').and.callThrough();
      component.getPlaylistItem();
      tick();
      expect(ytServiceFake.getPlaylistItem).toHaveBeenCalledWith(stubId);
      expect(component.item).toEqual(itemToReturn);
    }));

    it('populates error and errorSolution if ytService has a problem', fakeAsync(() => {
      let errorStub = 'error_stub';
      let solutionStub = 'some_solution';
      spyOn(ytServiceFake, 'getPlaylistItem').and.callFake(() => {
        return new Observable((observer) => {
          observer.error(errorStub);
        });
      });
      spyOn(ytServiceFake, 'giveErrorSolution').and.returnValue(solutionStub);
      component.getPlaylistItem();
      tick();
      expect(component.error).toEqual(errorStub);
      expect(component.errorSolution).toEqual(solutionStub);
    }));
  });

  describe('goBack', () => {
    it('calls location.back()', () => {
      expect(locationSpy.back).not.toHaveBeenCalled();
      component.goBack();
      expect(locationSpy.back).toHaveBeenCalled();
    });
  });

  describe('savePlaylistItem', () => {
    let itemToSave: PlaylistItem;
    let playlistIdStub = 'playlistId_stub';

    beforeEach(() => {
      itemToSave = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
      itemToSave.snippet.playlistId = playlistIdStub;
      component.item = itemToSave;
      spyOn(component, 'goBack');
    });

    it('asks ytService to update item', fakeAsync(() => {
      spyOn(ytServiceFake, 'updatePlaylistItem').and.callFake(() => {
        return new Observable();
      });
      component.savePlaylistItem();
      tick();
      expect(ytServiceFake.updatePlaylistItem).toHaveBeenCalledWith(itemToSave);
    }));

    it('sets ytService.playlistId if it does not exist, calls goBack', fakeAsync(() => {
      ytServiceFake.playlistId = undefined;
      component.savePlaylistItem();
      tick();
      expect(ytServiceFake.playlistId).toEqual(itemToSave.snippet.playlistId);
      expect(component.goBack).toHaveBeenCalled();
    }));

    it('leaves ytService.playlistId alone if it already exists, calls goBack', fakeAsync(() => {
      let differentPlaylistIdStub = 'some_other_id_stub';
      ytServiceFake.playlistId = differentPlaylistIdStub;
      component.savePlaylistItem();
      tick();
      expect(ytServiceFake.playlistId).toEqual(differentPlaylistIdStub);
      expect(component.goBack).toHaveBeenCalled();
    }));
  });
});
