import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { YtService, httpOptions } from './yt.service';
import { AuthService } from './auth.service';
import { PlaylistItemListResponse } from './playlistItemListResponse';
import { PlaylistItem } from './playlistItem';
import { HttpResponse } from '@angular/common/http';

describe('YtService', () => {
  let testedYtService: YtService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let ytUrl = 'https://www.googleapis.com/youtube/v3/playlistItems';

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signIn', 'getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        YtService,
        // Mock AuthService provider
        {
          provide: AuthService,
          useValue: authServiceSpy
        }
      ]
    });

    testedYtService = TestBed.get(YtService);
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('is created', () => {
    expect(testedYtService).toBeTruthy();
  });

  describe('setAccessToken', () => {

    it('changes the header to contain the access token', () => { 
      let stubToken = 'stub token';
      authServiceSpy.getToken.and.returnValue(stubToken);
      testedYtService.setAccessToken();
      expect(httpOptions.headers.get('Authorization')).toContain(stubToken);  
    });

    it('deletes the Authorization header if the authService throws an error', () => {
      authServiceSpy.getToken.and.throwError("error");
      testedYtService.setAccessToken();
      expect(httpOptions.headers.has('Authorization')).toBe(false);
    });
  });

  describe('GET', () => {

    describe('getPlaylistItems', () => {
      let expectedPlaylistResponse: PlaylistItemListResponse;
      let unexpectedPlaylistResponse;
      let playlistIdStub = "playlist_id";
      let pageTokenStub = "page_token";
      let GETPlayistUrl = ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet&playlistId=' + playlistIdStub + '&maxResults=50&pageToken=' + pageTokenStub
  
      beforeEach(() => {
        testedYtService.pageToken = pageTokenStub;
        expectedPlaylistResponse = {
          kind: "kind", //youtube#playlistItemListResponse
          etag: "etag", //etag
          nextPageToken: "next",
          prevPageToken: "prev",
          pageInfo: {
              totalResults: 1, //int
              resultsPerPage: 50 //int
          },
          items: [] //resource array
        }
        unexpectedPlaylistResponse = {}
      });
  
      it('returns expected playlist (one call)', () => {
        testedYtService.getPlaylistItems(playlistIdStub).subscribe(
          (playlist: PlaylistItemListResponse) => {
            expect(playlist).toBe(expectedPlaylistResponse);
          },
          fail
        );
  
        const request = httpTestingController.expectOne(GETPlayistUrl);
        expect(request.request.method).toEqual('GET');
  
        request.flush(expectedPlaylistResponse);
      });
  
      it('returns expected playlist (multiple calls)', () => {
        let timesToTest = 50;
        
        for (let i = 0; i < timesToTest; i++) {
          testedYtService.getPlaylistItems(playlistIdStub).subscribe(
            (playlist: PlaylistItemListResponse) => {
              if (i % 2 == 0)
                expect(playlist).toBe(expectedPlaylistResponse);
              else
                expect(playlist).toBe(unexpectedPlaylistResponse);
            }
          );
        }
  
        const requests = httpTestingController.match(GETPlayistUrl);
        expect(requests.length).toEqual(timesToTest);
  
        for (let i = 0; i < timesToTest; i++) {
          if (i % 2 == 0)
            requests[i].flush(expectedPlaylistResponse);
          else
            requests[i].flush(unexpectedPlaylistResponse);
        }
      });
      // TODO: test for http error response behaviour?
    });
  
    describe('getPlaylistItem', () => {
      let expectedListResponse: PlaylistItemListResponse;
      let expectedItemResponse: PlaylistItem;
      let unexpectedItemResponse: PlaylistItem;
      let playlistItemIdStub = "playlist_item_id";
      let GETPlayistItemUrl = ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet&id=' + playlistItemIdStub;

      beforeEach(() => {
        expectedListResponse = new PlaylistItemListResponse();
        expectedItemResponse = new PlaylistItem();
        expectedItemResponse.id = 'item_id';
        unexpectedItemResponse = new PlaylistItem();
        unexpectedItemResponse.id = 'unexpected_id';
        expectedListResponse.items = [expectedItemResponse];
      });

      it('returns expected playlist item (multiple calls)', () => {
        let timesToTest = 50;

        for (let i = 0; i < timesToTest; i++) {
          testedYtService.getPlaylistItem(playlistItemIdStub).subscribe(
            (response: PlaylistItemListResponse) => {
              expect(response.items[0]).toBe(expectedItemResponse);
            },
            fail
          );
        }

        const requests = httpTestingController.match(GETPlayistItemUrl);
        expect(requests.length).toEqual(timesToTest);

        for (let i = 0; i < timesToTest; i++) {
          requests[i].flush(expectedItemResponse);
        }
      });
    });
  });

  describe('PUT', () => {

    describe('updatePlaylistItem', () => {
      let PUTurl: string;
      let updatePlaylistItem: PlaylistItem;

      beforeEach(() => {
        PUTurl = ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet';
        updatePlaylistItem = {
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
              position: 1, //uint
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
      });

      it('requests an update to a play list item and returns it', () => {
        testedYtService.updatePlaylistItem(updatePlaylistItem).subscribe(
          (data) => {
            expect(data).toEqual(updatePlaylistItem);
          }
        );

        const request = httpTestingController.expectOne(PUTurl);
        expect(request.request.method).toEqual('PUT');

        const expectedResponse = new HttpResponse(
          {
            status: 200,
            statusText: 'OK',
            body: updatePlaylistItem
          }
        );
        request.event(expectedResponse);
      });
    });
  });

  describe('POST', () => {

    describe('addPlaylistItem', () => {
      let videoIdStub: string;
      let postPlaylistItem: PlaylistItem;
      let POSTurl: string;

      beforeEach(() => {
        POSTurl = ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet';
        videoIdStub = 'video_id_stub';
        postPlaylistItem = {
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
              position: 1, //uint
              resourceId: {
                  kind: 'string', //usually youtube#video
                  videoId: videoIdStub
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
        }
      });
      
      // this has to be here otherwise some weird error with no stacktrace happens...
      xit('um', () => {
        expect(true).toBe(true);
      });

      it('requests that an item be added and returns it', () => {
        testedYtService.addPlaylistItem(videoIdStub).subscribe(
          (response) => {
            expect(response).toBe(postPlaylistItem);
          },
          fail
        );

        const request = httpTestingController.expectOne(POSTurl);

        const expectedResponse = new HttpResponse(
          {
            status: 200,
            statusText: 'OK',
            body: postPlaylistItem
          }
        )

        request.event(expectedResponse);
      });
    });
  });

  describe('DELETE', () => {

  });
});
