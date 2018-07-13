import { PlaylistItem } from "src/app/playlistItem";
import { PlaylistItemListResponse } from "src/app/playlistItemListResponse";
import { YtService } from "src/app/yt.service";
import { Observable } from "rxjs";
import { PlaylistListResponse } from "src/app/playlistListResponse";
import { Playlist } from "src/app/playlist";

export class FakeYtService extends YtService {
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
    nextPageToken: "",
    prevPageToken: "",
    pageInfo: {
      totalResults: 1, //int
      resultsPerPage: 50 //int
    },
    items: [this.fixedFakePlaylistItem] //resource array
  };
  public fixedFakePlaylist: Playlist = {
    kind: 'string', //youtube#playlist
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
      tags: ['string'],
      defaultLanguage: 'string',
      localized: {
        title: 'string',
        description: 'string',
      },
    },
    status: {
      privacyStatus: 'string',
    },
    contentDetails: {
      itemCount: 1, //uint
    },
    player: {
      embedHtml: 'string',
    },
    localizations: {
      languageCode: { //only default language; other languages are available
        title: 'string',
        description: 'string',
      },
    },
  };
  public fixedFakePlaylistListResponse: PlaylistListResponse = {

    kind: 'string', //youtube#playlistListResponse
    etag: 'string', //etag
    nextPageToken: '',
    prevPageToken: '',
    pageInfo: {
      totalResults: 1, //int
      resultsPerPage: 50, //int
    },
    items: [Object.assign({}, this.fixedFakePlaylist)] //resource array
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
      // console.log("~~get subscription about to be fulfilled: " + this.playlistItemListResponseToReturn.items);
      if (this.itemsHasBeenSet) {
        this.playlistItemListResponseToReturn.items = this.itemsInPlaylistItemListResponseToReturnSliceOf;
      }
      observer.next(this.playlistItemListResponseToReturn);
      observer.complete();
    });
  }

  private itemsHasBeenSet: boolean = false;
  private _itemsInPlaylistItemListResponseToReturnSliceOf : PlaylistItem[];
  public get itemsInPlaylistItemListResponseToReturnSliceOf() : PlaylistItem[] {
    return this._itemsInPlaylistItemListResponseToReturnSliceOf.slice();
  }
  public set itemsInPlaylistItemListResponseToReturnSliceOf(v : PlaylistItem[]) {
    this.itemsHasBeenSet = true;
    this._itemsInPlaylistItemListResponseToReturnSliceOf = v;
  }
  

  //POST request for new PlaylistItem using its video ID
  addPlaylistItem(videoId: string): Observable<PlaylistItem> {
    // console.log("~~service.addPlaylistItem call with: " + videoId);
    this.fakeCloudPlaylist.push(this.playlistItemToAdd);

    return new Observable((observer) => {
      // console.log("~~add subscription about to be fulfilled: " + JSON.stringify(this.playlistItemToAdd));
      observer.next(this.playlistItemToAdd);
      observer.complete();
    });
  }

  //DELETE request for existing PlaylistItem using its ID
  deletePlaylistItem(items: PlaylistItem[]): Observable<PlaylistItem> {
    this.itemsToDelete = items;

    return new Observable((observer) => {
      // console.log('~~filter about to start, list length: ' + this.fakeCloudPlaylist.length);
      this.itemsToDelete.forEach((itemToDelete) => {
        this.fakeCloudPlaylist = this.fakeCloudPlaylist.filter((itemToFilter) => {
          // console.log("~~comparing filterId: " + itemToFilter.id + " and deleteId: " + itemToDelete.id);
          return itemToFilter.id !== itemToDelete.id;
        });
        // console.log("~~item deleted, list length: " + this.fakeCloudPlaylist.length);
        observer.next(itemToDelete);
      });
      observer.complete();
    });
  }

  //error handler that provides user-friendly advice/details for common error codes
  giveErrorSolution(error: any): string {
    return this.errorSolution;
  }

  public playlistListResponseToReturn: PlaylistListResponse;

  getPlaylists(): Observable<PlaylistListResponse> {

    //this.setAccessToken(); //authorization needed due to "mine" filter in GET request

    return new Observable((observer) => {
      observer.next(this.playlistListResponseToReturn)
      observer.complete();
    });
  }

  public playlistItemToReturn: PlaylistItem;

  getPlaylistItem(): Observable<PlaylistItemListResponse> {
    return new Observable((observer) => {
      // console.log("~~get subscription about to be fulfilled: " + this.playlistItemListResponseToReturn.items);

      let responseToReturn = Object.assign({}, this.fixedFakePlaylistItemListResponse);
      responseToReturn.items = [this.playlistItemToReturn];
      observer.next(responseToReturn);
      observer.complete();
    });
  }

  updatePlaylistItem(): Observable<any> {
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }
}
