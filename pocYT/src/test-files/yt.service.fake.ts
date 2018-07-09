import { PlaylistItem } from "src/app/playlistItem";
import { PlaylistItemListResponse } from "src/app/playlistItemListResponse";
import { YtService } from "src/app/yt.service";
import { Observable } from "rxjs";

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
      // console.log("~~get subscription about to be fulfilled: " + this.playlistItemListResponseToReturn.items);

      observer.next(this.playlistItemListResponseToReturn);
      observer.complete();
    });
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
}