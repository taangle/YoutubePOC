import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';

import { YtComponent } from './yt.component';
import { GoogleApiService } from "ng-gapi";
import { YtService } from '../yt.service';
import { PlaylistItem } from '../playlistItem';
import { PlaylistItemListResponse } from '../playlistItemListResponse';

fdescribe('YtComponent', () => {
  //#region Declarations and beforeEach
  let component: YtComponent;
  let fixture: ComponentFixture<YtComponent>;

  //#region Fake yt service declarations
  let ytServiceFake: FakeYtService;
  let fakeCloudPlaylist: PlaylistItem[];
  let itemsToDelete: PlaylistItem[];
  let errorSolution = 'I don\'t know what you\'re trying to do, but you can\'t do it.';
  let playlistIdStub = 'playlist_id_stub';
  let videoIdStub = 'videoId stub';
  let currentFakePlaylistItemListResponse: PlaylistItemListResponse;
  let currentFakePlaylistItem: PlaylistItem;
  let fixedFakePlaylistItem: PlaylistItem = {
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
  let fixedFakePlaylistItemListResponse: PlaylistItemListResponse = {
    kind: "kind", //youtube#playlistItemListResponse
    etag: "etag", //etag
    nextPageToken: "next",
    prevPageToken: "prev",
    pageInfo: {
      totalResults: 1, //int
      resultsPerPage: 50 //int
    },
    items: [fixedFakePlaylistItem] //resource array
  };
  //#endregion

  beforeEach(async(() => {
    fakeCloudPlaylist = new Array<PlaylistItem>();
    ytServiceFake = new FakeYtService();

    //#region Stub service getItems
    function getItemsSub(observer) {
      observer.next(currentFakePlaylistItemListResponse);
      observer.complete();
    }
    ytServiceFake.getPlaylistItems = jasmine.createSpy('getPlaylistItems').and.callFake((playlistId: string) => {
      console.log("~~called getPlaylistItems, list length: " + fakeCloudPlaylist.length);
      currentFakePlaylistItemListResponse = Object.assign({}, fixedFakePlaylistItemListResponse);
      currentFakePlaylistItemListResponse.pageInfo.totalResults = fakeCloudPlaylist.length;
      currentFakePlaylistItemListResponse.items = fakeCloudPlaylist;
      ytServiceFake.playlistId = playlistId;
      return new Observable(getItemsSub);
    });
    //#endregion

    //#region Stub service add
    function addSub(observer) {
      observer.next(currentFakePlaylistItem);
      observer.complete();
    }
    ytServiceFake.addPlaylistItem = jasmine.createSpy('addPlaylistItem').and.callFake((videoId: string) => {
      currentFakePlaylistItem = Object.assign({}, fixedFakePlaylistItem);
      fakeCloudPlaylist.push(currentFakePlaylistItem);
      return new Observable(addSub);
    });
    //#endregion

    //#region Stub service delete
    function deleteSub(observer) {
      console.log('~~filter about to start, list length: ' + fakeCloudPlaylist.length);
      itemsToDelete.forEach((itemToDelete) => {
        fakeCloudPlaylist = fakeCloudPlaylist.filter((itemToFilter) => {
          return itemToFilter.id !== itemToDelete.id;
        });
        console.log("~~item deleted, list length: " + fakeCloudPlaylist.length);
        observer.next(itemToDelete);
      });
      observer.complete();
    }
    ytServiceFake.deletePlaylistItem = jasmine.createSpy('deletePlaylistItem').and.callFake((items: PlaylistItem[]) => {
      console.log("~~deletion requested, list length: " + fakeCloudPlaylist.length);
      itemsToDelete = items;
      return new Observable(deleteSub);
    });
    //#endregion

    spyOn(ytServiceFake, 'giveErrorSolution').and.returnValue(errorSolution);

    //#region Configure TestBed and get component instance
    TestBed.configureTestingModule({
      declarations: [YtComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: YtService,
          useValue: ytServiceFake as YtService
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(YtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    //#endregion
  }));
  //#endregion

  //#region Whole suite
  it('is created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    describe('(when ytService has no playlistId)', () => {
      it('does not populate any of its fields', () => {
        expect(component.playlistItems).toBeUndefined();
        expect(component.playlistItemListResponse).toBeUndefined();
        expect(component.error).toBeUndefined();
        expect(component.errorSolution).toBeUndefined();
      });
    });

    xdescribe('*PENDING*(when ytService has a playlistId)', () => {
      beforeEach(() => {
        ytServiceFake.playlistId = playlistIdStub;
      });

      describe('(when ytService actually has a playlist for it)', () => {
        it('populates playlistItems and playlistItemListResponse', () => {
          let newComponent = new YtComponent(ytServiceFake);
          newComponent.ngOnInit();

          expect(newComponent.playlistItems).toEqual([fixedFakePlaylistItem]);
          expect(newComponent.playlistItemListResponse).toEqual(fixedFakePlaylistItemListResponse);
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
    let emptyPlaylistIdStub = '    ';

    it('should not call ytService on blank input', async () => {
      component.getPlaylistItems(emptyPlaylistIdStub);
      expect(ytServiceFake.getPlaylistItems).not.toHaveBeenCalled();
    });

    it('should call ytService with given playlistId input and update playlistItemListResponse and playlistItems', async () => {
      ytServiceFake.addPlaylistItem(videoIdStub);
      component.getPlaylistItems(playlistIdStub);
      expect(ytServiceFake.getPlaylistItems).toHaveBeenCalledWith(playlistIdStub);
      expect(component.playlistItemListResponse).toEqual(currentFakePlaylistItemListResponse);
      expect(component.playlistItems).toContain(currentFakePlaylistItem);
    });
  });

  describe('addPlaylistItem', () => {
    let emptyVideoIdStub = '    ';

    it('should not call ytService on blank input', async () => {
      component.addPlaylistItem(emptyVideoIdStub);
      expect(ytServiceFake.addPlaylistItem).not.toHaveBeenCalled();
    });

    xit('*PENDING*should call service with given videoId input and update playlistItems', async () => {
      // component.getPlaylistItems(playlistIdStub);
      // ytServiceFake.playlistId = playlistIdStub;
      // component.addPlaylistItem(videoIdStub);
      // expect(ytServiceFake.addPlaylistItem).toHaveBeenCalledWith(videoIdStub);
      // expect(component.playlistItems).toContain(currentFakePlaylistItem);
      component.getPlaylistItems(playlistIdStub);
      component.callGet();
    });
  });

  describe('deletePlaylistItems', () => {
    //#region Setup
    let nextIndexToDeleteAt = 0;
    let originalSize = 50;

    beforeEach(() => {
      // Populate cloud playlist?

    });
    //#endregion

    it('does something', async () => {
      let indexesToDeleteAt = [1, 5, 15, 49];
      indexesToDeleteAt.forEach((index) => {
        fakeCloudPlaylist[index] = new PlaylistItem();
        fakeCloudPlaylist[index].id = index.toString();
        component.toggleToDelete(index);
      });

      component.getPlaylistItems(playlistIdStub);
      component.deletePlaylistItems();
      expect(ytServiceFake.deletePlaylistItem).toHaveBeenCalled();
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
      expect(component.playlistItemListResponse).toEqual(fixedFakePlaylistItemListResponse);
      expect(component.playlistItems).toContain(fixedFakePlaylistItem);
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
  //#endregion

});

class FakeYtService {
  public playlistId: string; //holds current playlist ID
  public playlistPageToken: string = ''; //holds current page in current list of playlists
  public playlistItemPageToken: string = ''; //holds current page in current playlist

  //GET request for main playlist; can only receive up to 50 PlaylistItems at once
  getPlaylistItems(playlistId: string): Observable<PlaylistItemListResponse> {

  }

  //POST request for new PlaylistItem using its video ID
  addPlaylistItem(videoId: string): Observable<PlaylistItem> {

  }

  //DELETE request for existing PlaylistItem using its ID
  deletePlaylistItem(items: PlaylistItem[]): Observable<PlaylistItem> {

  }

  //error handler that provides user-friendly advice/details for common error codes
  giveErrorSolution(error: any): string {

  }
}
