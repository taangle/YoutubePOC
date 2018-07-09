import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';

import { YtComponent } from './yt.component';
import { GoogleApiService } from "ng-gapi";
import { YtService } from '../yt.service';
import { PlaylistItem } from '../playlistItem';
import { PlaylistItemListResponse } from '../playlistItemListResponse';

fdescribe('YtComponent', () => {
  let component: YtComponent;
  let fixture: ComponentFixture<YtComponent>;
  let ytServiceFake: FakeYtService;

  beforeEach(async(() => {
    ytServiceFake = new FakeYtService();

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

    describe('(when ytService has a playlistId)', () => {
      it('populates playlistItemListResponse', () => {
        let expectedResponse = new PlaylistItemListResponse();
        ytServiceFake.playlistItemListResponseToReturn = expectedResponse;
        ytServiceFake.playlistId = ytServiceFake.playlistIdStub;
        component.ngOnInit();
        expect(component.playlistItemListResponse).toBe(expectedResponse);
      });
      // TODO: add tests for error response
    });
  });

  describe('getPlaylistItems', () => {
    let blankPlaylistId = '   ';
    let getPlaylistItemsSpy;

    beforeEach(() => {
      getPlaylistItemsSpy = spyOn(ytServiceFake, 'getPlaylistItems').and.callThrough();
    });

    it('should not call out to service on blank input', fakeAsync(() => {
      component.getPlaylistItems(blankPlaylistId);
      tick();
      expect(getPlaylistItemsSpy).not.toHaveBeenCalled();
    }));

    it('should call ytService with given playlistId input and update playlistItemListResponse and playlistItems', (done) => {
      let expectedResponse = new PlaylistItemListResponse();
      ytServiceFake.playlistItemListResponseToReturn = expectedResponse;

      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      expect(getPlaylistItemsSpy).toHaveBeenCalledWith(ytServiceFake.playlistIdStub);
      getPlaylistItemsSpy.calls.mostRecent().returnValue.subscribe(() => {
        expect(component.playlistItemListResponse).toEqual(expectedResponse);
        done();
      });
    });
  });

  describe('addPlaylistItem', () => {
    let emptyVideoIdStub = '    ';
    let addPlaylistItemSpy;

    beforeEach(() => {
      addPlaylistItemSpy = spyOn(ytServiceFake, 'addPlaylistItem').and.callThrough();
    });

    it('should not call out to service on blank input', fakeAsync(() => {
      component.addPlaylistItem(emptyVideoIdStub);
      tick();
      expect(addPlaylistItemSpy).not.toHaveBeenCalled();
    }));

    it('asks service to add item with given videoId', fakeAsync(() => {
      ytServiceFake.fakeCloudPlaylist = new Array<PlaylistItem>(50);
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist;
      ytServiceFake.playlistItemToAdd = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);

      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      component.addPlaylistItem(ytServiceFake.videoIdStub);
      tick();

      expect(addPlaylistItemSpy).toHaveBeenCalledWith(ytServiceFake.videoIdStub);
    }));

    it('updates fields once the item is added (length >= 50)', fakeAsync(() => {
      let origLength: number = 50;
      ytServiceFake.fakeCloudPlaylist = new Array<PlaylistItem>(origLength);
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist;
      ytServiceFake.playlistItemToAdd = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);

      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      component.addPlaylistItem(ytServiceFake.videoIdStub);
      tick();

      expect(component.playlistItems.length).toBe(origLength + 1);
      expect(component.playlistItems).toContain(ytServiceFake.playlistItemToAdd);
    }));

    it('updates fields once the item is added (length < 50)', fakeAsync(() => {
      let origLength: number = 3;
      ytServiceFake.fakeCloudPlaylist = new Array<PlaylistItem>(origLength);
      ytServiceFake.fakeCloudPlaylist[origLength - 1] = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist.slice();
      ytServiceFake.playlistItemToAdd = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);

      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      component.addPlaylistItem(ytServiceFake.videoIdStub);
      tick();

      expect(component.playlistItems.length).toBe(origLength + 1);
      expect(component.playlistItems).toContain(ytServiceFake.playlistItemToAdd);
    }));
  });

  describe('deletePlaylistItems', () => {
    it('asks service to delete a playlist of items', fakeAsync(() => {
      let items: PlaylistItem[] = new Array<PlaylistItem>(5);
      for (let i = 0; i < items.length; i++) {
        items[i] = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
      }
      ytServiceFake.fakeCloudPlaylist = items;
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist;

      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      component.toggleToDelete(0);
      spyOn(ytServiceFake, 'deletePlaylistItem').and.returnValue(new Observable());
      component.deletePlaylistItems();
      tick();
      expect(ytServiceFake.deletePlaylistItem).toHaveBeenCalledWith([ytServiceFake.fakeCloudPlaylist[0]]);
    }));

    it('does not ask service to delete anything if nothing has been marked for deletion', fakeAsync(() => {
      let items: PlaylistItem[] = new Array<PlaylistItem>(5);
      for (let i = 0; i < items.length; i++) {
        items[i] = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
      }
      ytServiceFake.fakeCloudPlaylist = items;
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist;

      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      spyOn(ytServiceFake, 'deletePlaylistItem').and.returnValue(new Observable());
      component.deletePlaylistItems();
      tick();
      expect(ytServiceFake.deletePlaylistItem).not.toHaveBeenCalled();
    }));

    it('updates fields from service once items are deleted', fakeAsync(() => {
      let items: PlaylistItem[] = new Array<PlaylistItem>(5);
      for (let i = 0; i < items.length; i++) {
        items[i] = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
      }
      ytServiceFake.fakeCloudPlaylist = items;
      ytServiceFake.playlistId = ytServiceFake.playlistIdStub;
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist;

      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      component.toggleToDelete(0);
      component.deletePlaylistItems();
      tick();
      expect(component.playlistItemListResponse).toEqual(ytServiceFake.playlistItemListResponseToReturn);
      expect(component.playlistItems).toEqual(ytServiceFake.playlistItemListResponseToReturn.items);
    }));
  });

  describe('toPrevPage', () => {
    let prevPageTokenStub: string;

    beforeEach(() => {
      prevPageTokenStub = 'prev_page_token_stub';
      ytServiceFake.playlistItemListResponseToReturn = new PlaylistItemListResponse();
      ytServiceFake.playlistItemListResponseToReturn.prevPageToken = prevPageTokenStub;
    });

    it('sets service\'s page token to response\'s prev page token', fakeAsync(() => {
      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      component.toPrevPage();
      tick();
      expect(ytServiceFake.playlistItemPageToken).toEqual(prevPageTokenStub);
    }));

    it('populates its fields from service after setting the page token', fakeAsync(() => {
      ytServiceFake.fakeCloudPlaylist = new Array<PlaylistItem>();
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist.slice();
      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      component.toPrevPage();
      tick();
      expect(component.playlistItemListResponse).toEqual(ytServiceFake.playlistItemListResponseToReturn);
      expect(component.playlistItems).toEqual(ytServiceFake.fakeCloudPlaylist);
    }));
  });

  describe('toNextPage', () => {
    let nextPageTokenStub: string;

    beforeEach(() => {
      let nextPageTokenStub: string = 'next_page_token_stub';
      ytServiceFake.playlistItemListResponseToReturn = new PlaylistItemListResponse();
      ytServiceFake.playlistItemListResponseToReturn.prevPageToken = nextPageTokenStub;
    });

    it('sets service\'s page token to response\'s next page token', fakeAsync(() => {
      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      component.toNextPage();
      tick();
      expect(ytServiceFake.playlistItemPageToken).toEqual(nextPageTokenStub);
    }));

    it('populates its fields from service after setting the page token', fakeAsync(() => {
      ytServiceFake.fakeCloudPlaylist = new Array<PlaylistItem>();
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist.slice();
      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      component.toNextPage();
      tick();
      expect(component.playlistItemListResponse).toEqual(ytServiceFake.playlistItemListResponseToReturn);
      expect(component.playlistItems).toEqual(ytServiceFake.fakeCloudPlaylist);
    }));
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

class FakeYtService extends YtService {
  public playlistId: string; //holds current playlist ID
  public playlistPageToken: string = ''; //holds current page in current list of playlists
  public playlistItemPageToken: string = ''; //holds current page in current playlist

  public fakeCloudPlaylist: PlaylistItem[];
  public itemsToDelete: PlaylistItem[];

  public playlistItemListResponseToReturn: PlaylistItemListResponse;
  public playlistItemToAdd: PlaylistItem;
  public fixedFakePlaylistItem: PlaylistItem = {
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
  public fixedFakePlaylistItemListResponse: PlaylistItemListResponse = {
    kind: "kind", //youtube#playlistItemListResponse
    etag: "etag", //etag
    nextPageToken: "next",
    prevPageToken: "prev",
    pageInfo: {
      totalResults: 1, //int
      resultsPerPage: 50 //int
    },
    items: [this.fixedFakePlaylistItem] //resource array
  };

  public errorSolution = 'I don\'t know what you\'re trying to do, but you can\'t do it.';
  public playlistIdStub = 'playlist_id_stub';
  public videoIdStub = 'videoId_stub';

  constructor() {
    super(null, null);
    this.fakeCloudPlaylist = new Array<PlaylistItem>();
    this.playlistItemListResponseToReturn = new PlaylistItemListResponse();
  }

  //GET request for main playlist; can only receive up to 50 PlaylistItems at once
  getPlaylistItems(playlistId: string): Observable<PlaylistItemListResponse> {
    this.playlistId = playlistId;
    return new Observable((observer) => {
      console.log("~~get subscription about to be fulfilled: " + this.playlistItemListResponseToReturn.items);

      observer.next(this.playlistItemListResponseToReturn);
      observer.complete();
    });
  }

  //POST request for new PlaylistItem using its video ID
  addPlaylistItem(videoId: string): Observable<PlaylistItem> {
    console.log("~~service.addPlaylistItem call with: " + videoId);
    this.fakeCloudPlaylist.push(this.playlistItemToAdd);

    return new Observable((observer) => {
      console.log("~~add subscription about to be fulfilled: " + JSON.stringify(this.playlistItemToAdd));
      observer.next(this.playlistItemToAdd);
      observer.complete();
    });
  }

  //DELETE request for existing PlaylistItem using its ID
  deletePlaylistItem(items: PlaylistItem[]): Observable<PlaylistItem> {
    this.itemsToDelete = items;

    return new Observable((observer) => {
      console.log('~~filter about to start, list length: ' + this.fakeCloudPlaylist.length);
      this.itemsToDelete.forEach((itemToDelete) => {
        this.fakeCloudPlaylist = this.fakeCloudPlaylist.filter((itemToFilter) => {
          console.log("~~comparing filterId: " + itemToFilter.id + " and deleteId: " + itemToDelete.id);
          return itemToFilter.id !== itemToDelete.id;
        });
        console.log("~~item deleted, list length: " + this.fakeCloudPlaylist.length);
        observer.next(itemToDelete);
      });
      observer.complete();
    });
  }

  //error handler that provides user-friendly advice/details for common error codes
  giveErrorSolution(error: any): string {
    return this.errorSolution;
  }
}
