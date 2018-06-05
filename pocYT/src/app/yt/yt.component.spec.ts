import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';

import { YtComponent } from './yt.component';
import { GoogleApiService } from "ng-gapi";
import { YtService } from '../yt.service';
import { PlaylistItem } from '../playlistItem';
import { PlaylistItemListResponse } from '../playlistItemListResponse';

describe('YtComponent', () => {
  let component: YtComponent;
  let fixture: ComponentFixture<YtComponent>;

  let ytServiceSpy: jasmine.SpyObj<YtService>;
  let gapiServiceSpy: jasmine.SpyObj<GoogleApiService>;
  let fakePlaylistItem: PlaylistItem = {
      kind: 'string', //youtube#playlistItem
      etag: 'string', //etag
      id: 'string',
      snippet: {
          publishedAt: 'string', //datetime
          channelId: 'string',
          title: 'string',
          description: 'string',
          thumbnails: {
              default: { //only default thumbnail; other resolutions are available
                  url: 'string',
                  width: 1, //uint
                  height: 1, //uint
              },
          },
          channelTitle: 'string',
          playlistId: 'string',
          position: 0, //uint
          resourceId: {
              kind: 'string', //usually youtube#video
              videoId: 'string'
          },
      },
      contentDetails: {
          videoId: 'string',
          startAt: 'string',
          endAt: 'string',
          note: 'string',
          videoPublishedAt: 'string' //datetime
      },
      status: {
          privacyStatus: 'string',
      }
  };
  let fakePlaylistItemListResponse: PlaylistItemListResponse = {
      kind: "kind", //youtube#playlistItemListResponse
      etag: "etag", //etag
      nextPageToken: "next",
      prevPageToken: "prev",
      pageInfo: {
          totalResults: 1, //int
          resultsPerPage: 50 //int
      },
      items: [fakePlaylistItem] //resource array
  };

  function setUpGoogleApi() {

      function subscription(observer) {
          observer.next();
          observer.complete();
      }
      gapiServiceSpy.onLoad.and.callFake(() => {
          return new Observable(subscription);
      });
      
  }

  function setUpGetPlaylistItems() {

      function subscription(observer) {
          observer.next(fakePlaylistItemListResponse);
          observer.complete();
      }
      ytServiceSpy.getPlaylistItems.and.callFake(() => {
          return new Observable(subscription);
      });

  }

  function setUpAddPlaylistItem() {

      function subscription(observer) {
          observer.next(fakePlaylistItem);
          observer.complete();
      }
      ytServiceSpy.addPlaylistItem.and.callFake(() => {
          return new Observable(subscription);
      });

  }

  function setUpDeletePlaylistItem() {

      function subscription(observer) {
          observer.next(fakePlaylistItem);
          observer.complete();
      }
      ytServiceSpy.deletePlaylistItem.and.callFake(() => {
          return new Observable(subscription);
      });

  }

  beforeEach(async(() => {
      ytServiceSpy = jasmine.createSpyObj('YtService', ['getPlaylistItems', 'addPlaylistItem', 'deletePlaylistItem', 'giveErrorSolution']);
      gapiServiceSpy = jasmine.createSpyObj('GoogleApiService', ['onLoad']);

      setUpGoogleApi();
      setUpGetPlaylistItems();
      setUpAddPlaylistItem();
      setUpDeletePlaylistItem();

    TestBed.configureTestingModule({
        declarations: [YtComponent],
        imports: [RouterTestingModule],
        providers: [
            {
                provide: YtService,
                useValue: ytServiceSpy
            },
            {
                provide: GoogleApiService,
                useValue: gapiServiceSpy
            }
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has all properties undefined initially', () => {
      expect(component.playlistItems).toBeUndefined();
      expect(component.playlistItemListResponse).toBeUndefined();
      expect(component.error).toBeUndefined();
      expect(component.errorSolution).toBeUndefined();
  });

  describe('ngOnInit', () => {

      let playlistIdStub = 'playlistId stub';

      it('should not call service initially', () => {
          spyOn(component, 'getPlaylistItems');
          component.ngOnInit();
          expect(component.getPlaylistItems).not.toHaveBeenCalled();
      });

      it('should call service', () => {
          component.getPlaylistItems(playlistIdStub);
          spyOn(component, 'getPlaylistItems');
          component.ngOnInit();
          expect(component.getPlaylistItems).toHaveBeenCalled();
      });

  });

  describe('getPlaylistItems', () => {

      let playlistIdStub = 'playlistId stub';
      let emptyPlaylistIdStub = '    ';

      it('should not call service on blank input', () => {
          component.getPlaylistItems(emptyPlaylistIdStub);
          expect(ytServiceSpy.getPlaylistItems).not.toHaveBeenCalled();
      });

      it('should call service with given playlistId input and update playlistItemListResponse and playlistItems', () => {
          component.getPlaylistItems(playlistIdStub);
          expect(ytServiceSpy.getPlaylistItems).toHaveBeenCalledWith(playlistIdStub);
          expect(component.playlistItemListResponse).toEqual(fakePlaylistItemListResponse);
          expect(component.playlistItems).toContain(fakePlaylistItem);
      });

  });

  describe('addPlaylistItem', () => {

      let playlistIdStub = 'playlistId stub';
      let videoIdStub = 'videoId stub';
      let emptyVideoIdStub = '    ';

      it('should not call service on blank input', () => {
          component.getPlaylistItems(playlistIdStub);
          component.addPlaylistItem(emptyVideoIdStub);
          expect(ytServiceSpy.addPlaylistItem).not.toHaveBeenCalled();
      });

      it('should call service with given videoId input and update playlistItems', () => {
          component.getPlaylistItems(playlistIdStub);
          component.addPlaylistItem(videoIdStub);
          expect(ytServiceSpy.addPlaylistItem).toHaveBeenCalledWith(videoIdStub);
          expect(component.playlistItems).toContain(fakePlaylistItem);
      });

  });

  describe('deletePlaylistItem', () => {

      let playlistIdStub = 'playlistId stub';

      it('should call service with given playlistItem and update playlistItems', () => {
          component.getPlaylistItems(playlistIdStub);
          component.deletePlaylistItem(fakePlaylistItem);
          expect(ytServiceSpy.deletePlaylistItem).toHaveBeenCalledWith(fakePlaylistItem.id);
          expect(component.playlistItems).not.toContain(fakePlaylistItem);
      });

  });

  describe('toPrevPage', () => {

      let playlistIdStub = 'playlistId stub';

      it('should call service and update playlistItemListResponse and playlistItems', () => {
          component.getPlaylistItems(playlistIdStub);
          component.toPrevPage();
          expect(ytServiceSpy.getPlaylistItems).toHaveBeenCalledWith(playlistIdStub);
          expect(component.playlistItemListResponse).toEqual(fakePlaylistItemListResponse);
          expect(component.playlistItems).toContain(fakePlaylistItem);
      });

  });

  describe('toNextPage', () => {

      let playlistIdStub = 'playlistId stub';

      it('should call service and update playlistItemListResponse and playlistItems', () => {
          component.getPlaylistItems(playlistIdStub);
          component.toNextPage();
          expect(ytServiceSpy.getPlaylistItems).toHaveBeenCalledWith(playlistIdStub);
          expect(component.playlistItemListResponse).toEqual(fakePlaylistItemListResponse);
          expect(component.playlistItems).toContain(fakePlaylistItem);
      });
   
  });

  describe('clearErrors', () => {

      it('should set error and errorSolution to null', () => {
          component.clearErrors();
          expect(component.error).toBeNull();
          expect(component.errorSolution).toBeNull();
      });

  });

});
