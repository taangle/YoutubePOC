import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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

    it('should not call out to service on blank input', () => {
      component.getPlaylistItems(blankPlaylistId);
      expect(getPlaylistItemsSpy).not.toHaveBeenCalled();
    });

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

    it('should not call out to service on blank input', () => {
      component.addPlaylistItem(emptyVideoIdStub);
      expect(addPlaylistItemSpy).not.toHaveBeenCalled();
    });

    xit('*PENDING*should call service with given videoId input and update playlistItems', () => {
      let expectedAddedItem = new PlaylistItem();
      ytServiceFake.playlistItemToAdd = expectedAddedItem;

      let expectedResponse = new PlaylistItemListResponse();
      expectedResponse.items = [expectedAddedItem];
      expectedResponse.pageInfo = {
        totalResults: 1,
        resultsPerPage: 50
      };
      ytServiceFake.playlistItemListResponseToReturn = expectedResponse;

      component.addPlaylistItem(ytServiceFake.videoIdStub);
      expect(addPlaylistItemSpy).toHaveBeenCalledWith(ytServiceFake.videoIdStub);
      // expect(component.playlistItemListResponse).toBe(expectedResponse);
      // expect(component.playlistItems[0]).toBe(expectedAddedItem);
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
  public videoIdStub = 'videoId stub';

  constructor() {
    super(null, null);
    this.fakeCloudPlaylist = new Array<PlaylistItem>();
    this.playlistItemListResponseToReturn = new PlaylistItemListResponse();
  }

  //GET request for main playlist; can only receive up to 50 PlaylistItems at once
  getPlaylistItems(playlistId: string): Observable<PlaylistItemListResponse> {
    this.playlistId = playlistId;
    return new Observable((observer) => {
      console.log("~~subscription about to be fulfilled: " + this.playlistItemListResponseToReturn);
      
      observer.next(this.playlistItemListResponseToReturn);
      observer.complete();
    });
  }

  //POST request for new PlaylistItem using its video ID
  addPlaylistItem(videoId: string): Observable<PlaylistItem> {
    this.fakeCloudPlaylist.push(this.playlistItemToAdd);

    return new Observable((observer) => {
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
