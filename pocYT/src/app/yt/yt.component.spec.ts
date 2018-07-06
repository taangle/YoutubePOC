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

  let ytServiceFake;
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
  let errorSolution = 'I don\'t know what you\'re trying to do, but you can\'t do it.';

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
    spyOn(ytServiceFake, 'getPlaylistItems').and.callFake((id: string) => {
      ytServiceFake.playlistId = id;
      return new Observable(subscription);
    });

  }
  function setUpAddPlaylistItem() {

    function subscription(observer) {
      observer.next(fakePlaylistItem);
      observer.complete();
    }
    spyOn(ytServiceFake, 'addPlaylistItem').and.callFake(() => {
      return new Observable(subscription);
    });

  }
  function setUpDeletePlaylistItem() {
    function subscription(observer) {
      observer.next(fakePlaylistItem);
      observer.complete();
    }
    spyOn(ytServiceFake, 'deletePlaylistItem').and.callFake(() => {
      return new Observable(subscription);
    });
  }
  function setUpGiveErrorSolution() {
    spyOn(ytServiceFake, 'giveErrorSolution').and.returnValue(errorSolution);
  }

  beforeEach(async(() => {
    ytServiceFake = {
      playlistId: <string>null,
      pageToken: <string>null,
      getPlaylistItems: function () { },
      addPlaylistItem: function () { },
      deletePlaylistItem: function () { },
      giveErrorSolution: function () { }
    };
    gapiServiceSpy = jasmine.createSpyObj('GoogleApiService', ['onLoad']);

    setUpGoogleApi();
    setUpGetPlaylistItems();
    setUpAddPlaylistItem();
    setUpDeletePlaylistItem();
    setUpGiveErrorSolution();

    TestBed.configureTestingModule({
      declarations: [YtComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: YtService,
          useValue: ytServiceFake as YtService
        },
        {
          provide: GoogleApiService,
          useValue: gapiServiceSpy
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(YtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('is created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    let playlistIdStub = 'playlistId stub';

    describe('(when ytService has no playlistId)', () => {
      it('does not populate any of its fields', () => {
        expect(component.playlistItems).toBeUndefined();
        expect(component.playlistItemListResponse).toBeUndefined();
        expect(component.error).toBeUndefined();
        expect(component.errorSolution).toBeUndefined();
      });
    });

    describe('(when ytService has a playlistId)', () => {
      beforeEach(() => {
        ytServiceFake.playlistId = playlistIdStub;
      });

      describe('(when ytService actually has a playlist for it)', () => {
        it('*PENDING* populates playlistItems and playlistItemListResponse', () => {
          // let newComponent = new YtComponent(ytServiceFake, gapiServiceSpy);
          // newComponent.ngOnInit();

          // expect(newComponent.playlistItems).toEqual([fakePlaylistItem]);
          // expect(newComponent.playlistItemListResponse).toEqual(fakePlaylistItemListResponse);
        });
      });

      describe('(when ytService has a problem retrieving the playlist)', () => {
        let error = '403';

        beforeEach(() => {
          function subscription(observer) {
            observer.error(error);
            observer.complete();
          }

          ytServiceFake.getPlaylistItems = jasmine.createSpy().and.callFake(() => {
            return new Observable(subscription);
          });
        });

        it('populates error and errorSolution ', () => {
          let newComponent = new YtComponent(ytServiceFake);
          newComponent.ngOnInit();

          expect(newComponent.error).toEqual(error);
          expect(newComponent.errorSolution).toEqual(errorSolution);
        });
      });
    });
  });

  describe('getPlaylistItems', () => {
    let playlistIdStub = 'playlistId stub';
    let emptyPlaylistIdStub = '    ';

    it('should not call ytService on blank input', () => {
      component.getPlaylistItems(emptyPlaylistIdStub);
      expect(ytServiceFake.getPlaylistItems).not.toHaveBeenCalled();
    });

    it('should call ytService with given playlistId input and update playlistItemListResponse and playlistItems', () => {
      component.getPlaylistItems(playlistIdStub);
      expect(ytServiceFake.getPlaylistItems).toHaveBeenCalledWith(playlistIdStub);
      expect(component.playlistItemListResponse).toEqual(fakePlaylistItemListResponse);
      expect(component.playlistItems).toContain(fakePlaylistItem);
    });
  });

  describe('addPlaylistItem', () => {
    let playlistIdStub = 'playlistId stub';
    let videoIdStub = 'videoId stub';
    let emptyVideoIdStub = '    ';

    it('should not call ytService on blank input', () => {
      component.getPlaylistItems(playlistIdStub);
      component.addPlaylistItem(emptyVideoIdStub);
      expect(ytServiceFake.addPlaylistItem).not.toHaveBeenCalled();
    });

    it('should call service with given videoId input and update playlistItems', () => {
      component.getPlaylistItems(playlistIdStub);
      component.addPlaylistItem(videoIdStub);
      expect(ytServiceFake.addPlaylistItem).toHaveBeenCalledWith(videoIdStub);
      expect(component.playlistItems).toContain(fakePlaylistItem);
    });
  });

  xdescribe('*PENDING* deletePlaylistItem', () => {

    beforeEach(() => {
      component.playlistItems = new Array(50);
      component.playlistItems.forEach((item) => {
        item = new PlaylistItem();
      });
    });

    it('calls ytService.deletePlaylistItem with array of items marked for deletion', () => {
      let indexesToDeleteAt = [1, 5, 15, 50];
      indexesToDeleteAt.forEach((index) => {
        component.toggleToDelete(index);
      });
      component.deletePlaylistItem();
      expect(component.playlistItems.length).toBe(50 - indexesToDeleteAt.length);
    });
  });

  xdescribe('*PENDING* toPrevPage', () => {

    let playlistIdStub = 'pl_id_stub_for_prevPage';

    beforeEach(() => {
      component.getPlaylistItems(playlistIdStub);

      console.log("~~~~beforeEach fake.id: " + ytServiceFake.playlistId);
      component.toPrevPage();
    });

    xit('*PENDING* sets ytService.pageToken with playlistItemResponse.prevPageToken', () => {
      // expect(ytServiceFake.pageToken).toEqual(fakePlaylistItemListResponse.prevPageToken);
    });

    xit('calls this.getPlaylistItems with ytService.playlistId', () => {
      expect(component.getPlaylistItems).toHaveBeenCalledWith(playlistIdStub);
    });
  });

  xdescribe('*PENDING* toNextPage', () => {

    let playlistIdStub = 'playlistId stub';

    beforeEach(() => {
      ytServiceFake.playlistId = playlistIdStub;
    });

    it('should call service and update playlistItemListResponse and playlistItems', () => {
      console.log("~~~~1" + ytServiceFake.playlistId);

      component.getPlaylistItems(playlistIdStub);

      console.log("~~~2" + ytServiceFake.playlistId);

      component.toNextPage();

      console.log("~~~~3" + ytServiceFake.playlistId);

      expect(ytServiceFake.getPlaylistItems).toHaveBeenCalledWith(playlistIdStub);
      expect(component.playlistItemListResponse).toEqual(fakePlaylistItemListResponse);
      expect(component.playlistItems).toContain(fakePlaylistItem);
    });

  });

  describe('clearErrors', () => {

    it('should set error and errorSolution to null', () => {
      component.error = "some error";
      component.errorSolution = "some solution";
      component.clearErrors();
      expect(component.error).toBeNull();
      expect(component.errorSolution).toBeNull();
    });

  });

});
