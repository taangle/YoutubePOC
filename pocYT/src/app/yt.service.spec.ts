import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { YtService, httpOptions } from './yt.service';
import { AuthService } from './auth.service';
import { PlaylistItemListResponse } from './playlistItemListResponse';
import { PlaylistItem } from './playlistItem';
import { PlaylistListResponse } from './playlistListResponse';
import { Playlist } from './playlist';

describe('YtService', () => {
  let testedYtService: YtService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let ytUrl: string = 'https://www.googleapis.com/youtube/v3/playlistItems';
  let ytPlaylistUrl: string = 'https://www.googleapis.com/youtube/v3/playlists';

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
      let stubToken: string = 'stub token';
      authServiceSpy.getToken.and.returnValue(stubToken);
      testedYtService.setAccessToken();
      expect(httpOptions.headers.get('Authorization')).toContain(stubToken);
    });

    it('deletes the Authorization header if the authService throws an error', () => {
      authServiceSpy.getToken.and.throwError('error');
      testedYtService.setAccessToken();
      expect(httpOptions.headers.has('Authorization')).toBe(false);
    });
  });

  describe('GET', () => {

    describe('getPlaylists', () => {
      let expectedPlaylistListResponse: PlaylistListResponse;
      let unexpectedResponse;
      let pageTokenStub: string = 'page_token';
      let GETPlaylistsUrl: string = ytPlaylistUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet&mine=true&maxResults=50&pageToken=' + pageTokenStub;

      beforeEach(() => {
        testedYtService.playlistPageToken = pageTokenStub;
        expectedPlaylistListResponse = {
          kind: "kind",
          etag: "etag",
          nextPageToken: "next",
          prevPageToken: "prev",
          pageInfo: {
            totalResults: 1,
            resultsPerPage: 50
          },
          items: []
        }
        unexpectedResponse = {};
      });

      it('returns expected playlists (one call)', async () => {
        testedYtService.getPlaylists().subscribe(
          (playlistListResponse: PlaylistListResponse) => {
            expect(playlistListResponse).toBe(expectedPlaylistListResponse);
          },
          fail
        );

        const request = httpTestingController.expectOne(GETPlaylistsUrl);
        expect(request.request.method).toEqual('GET');
        request.flush(expectedPlaylistListResponse);
      });

      it('returns a not found error', () => {
        let errorText: string;
        testedYtService.getPlaylists().subscribe(
          fail,
          (error: string) => {
            errorText = error;
          }
        );

        const request = httpTestingController.expectOne(GETPlaylistsUrl);
        expect(request.request.method).toEqual('GET');

        const expectedResponseBody = {
          error: {
            error: {
              message: 'Not Found'
            }
          }
        };
        const expectedResponse = new HttpErrorResponse(
          {
            status: 404,
            statusText: 'Not Found'
          }
        );
        request.flush(expectedResponseBody, expectedResponse);

        expect(errorText).toContain('404');
      });
    });

    describe('getPlaylistItems', () => {
      let expectedPlaylistResponse: PlaylistItemListResponse;
      let unexpectedResponse;
      let playlistIdStub: string = 'playlist_id';
      let pageTokenStub: string = 'page_token';
      let GETPlaylistUrl: string = ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet&playlistId=' + playlistIdStub + '&maxResults=50&pageToken=' + pageTokenStub;

      beforeEach(() => {
        testedYtService.playlistItemPageToken = pageTokenStub;
        expectedPlaylistResponse = {
          kind: "kind",
          etag: "etag",
          nextPageToken: "next",
          prevPageToken: "prev",
          pageInfo: {
            totalResults: 1,
            resultsPerPage: 50
          },
          items: []
        }
        unexpectedResponse = {}
      });

      it('returns expected playlist (one call)', async () => {
        testedYtService.getPlaylistItems(playlistIdStub).subscribe(
          (playlist: PlaylistItemListResponse) => {
            expect(testedYtService.playlistId).toEqual(playlistIdStub);
            expect(playlist).toBe(expectedPlaylistResponse);
          },
          fail
        );

        const request = httpTestingController.expectOne(GETPlaylistUrl);
        expect(request.request.method).toEqual('GET');
        request.flush(expectedPlaylistResponse);
      });

      it('returns expected playlist (multiple calls)', async () => {
        let timesToTest: number = 50;
        for (let i: number = 0; i < timesToTest; ++i) {
          testedYtService.getPlaylistItems(playlistIdStub).subscribe(
            (playlist: PlaylistItemListResponse) => {
              expect(testedYtService.playlistId).toEqual(playlistIdStub);
              if (i % 2 === 0)
                expect(playlist).toBe(expectedPlaylistResponse);
              else
                expect(playlist).toBe(unexpectedResponse);
            }
          );
        }

        const requests = httpTestingController.match(GETPlaylistUrl);
        expect(requests.length).toEqual(timesToTest);

        for (let i: number = 0; i < timesToTest; ++i) {
          if (i % 2 === 0)
            requests[i].flush(expectedPlaylistResponse);
          else
            requests[i].flush(unexpectedResponse);
        }
      });
      // TODO: test for http error response behaviour?

      it('returns a not found error', () => {
        let errorText: string;
        testedYtService.getPlaylistItems(playlistIdStub).subscribe(
          fail,
          (error: string) => {
            expect(testedYtService.playlistId).toEqual(playlistIdStub);
            errorText = error;
          }
        );

        const request = httpTestingController.expectOne(GETPlaylistUrl);
        expect(request.request.method).toEqual('GET');

        const expectedResponseBody = {
          error: {
            error: {
              message: 'Not Found'
            }
          }
        };
        const expectedResponse = new HttpErrorResponse(
          {
            status: 404,
            statusText: 'Not Found'
          }
        );
        request.flush(expectedResponseBody, expectedResponse);

        expect(errorText).toContain('404');
      });
    });

    describe('getPlaylistItem', () => {
      let expectedListResponse: PlaylistItemListResponse;
      let expectedItemResponse: PlaylistItem;
      let unexpectedItemResponse: PlaylistItem;
      let playlistItemIdStub: string = 'playlist_item_id';
      let GETPlayistItemUrl = ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet&id=' + playlistItemIdStub;

      beforeEach(() => {
        expectedListResponse = new PlaylistItemListResponse;
        expectedItemResponse = new PlaylistItem;
        expectedItemResponse.id = 'item_id';
        unexpectedItemResponse = new PlaylistItem;
        unexpectedItemResponse.id = 'unexpected_id';
        expectedListResponse.items = [expectedItemResponse];
      });

      it('returns expected playlist item (multiple calls)', () => {
        let timesToTest: number = 50;
        for (let i: number = 0; i < timesToTest; ++i) {
          testedYtService.getPlaylistItem(playlistItemIdStub).subscribe(
            (response: PlaylistItemListResponse) => {
              expect(response.items[0]).toBe(expectedItemResponse);
            },
            fail
          );
        }

        const requests = httpTestingController.match(GETPlayistItemUrl);
        expect(requests.length).toEqual(timesToTest);

        for (let i: number = 0; i < timesToTest; ++i) {
          requests[i].flush(expectedListResponse);
        }
      });

      it('returns a not found error', () => {
        let errorText: string;
        testedYtService.getPlaylistItem(playlistItemIdStub).subscribe(
          fail,
          (error: string) => {
            errorText = error;
          }
        );

        const request = httpTestingController.expectOne(GETPlayistItemUrl);
        expect(request.request.method).toEqual('GET');

        const expectedResponseBody = {
          error: {
            error: {
              message: 'Not Found'
            }
          }
        };
        const expectedResponse = new HttpErrorResponse(
          {
            status: 404,
            statusText: 'Not Found'
          }
        );
        request.flush(expectedResponseBody, expectedResponse);

        expect(errorText).toContain('404');
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
          kind: "string",
          etag: "string",
          id: "string",
          snippet: {
            publishedAt: "string",
            channelId: "string",
            title: "string",
            description: "string",
            thumbnails: {
              default: {
                url: "string",
                width: 1,
                height: 1
              }
            },
            channelTitle: "string",
            playlistId: "string",
            position: 1,
            resourceId: {
              kind: "string",
              videoId: "string"
            }
          },
          contentDetails: {
            videoId: "string",
            startAt: "string",
            endAt: "string",
            note: "string",
            videoPublishedAt: "string"
          },
          status: {
            privacyStatus: "string"
          }
        };
      });

      it('requests an update to a play list item and returns it', () => {
        testedYtService.updatePlaylistItem(updatePlaylistItem).subscribe(
          (data: PlaylistItem) => {
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

      it('requests an update to a playlist item and gets an unauthorized error', () => {
        let errorText: string;
        testedYtService.updatePlaylistItem(updatePlaylistItem).subscribe(
          fail,
          (error: string) => {
            errorText = error;
          }
        );

        const request = httpTestingController.expectOne(PUTurl);
        expect(request.request.method).toEqual('PUT');

        const expectedResponseBody = {
          error: {
            error: {
              message: 'Unauthorized'
            }
          }
        };
        const expectedResponse = new HttpErrorResponse(
          {
            status: 401,
            statusText: 'Unauthorized'
          }
        );
        request.flush(expectedResponseBody, expectedResponse);

        expect(errorText).toContain('401');
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
          kind: "string",
          etag: "string",
          id: "string",
          snippet: {
            publishedAt: "string",
            channelId: "string",
            title: "string",
            description: "string",
            thumbnails: {
              default: {
                url: "string",
                width: 1,
                height: 1
              }
            },
            channelTitle: "string",
            playlistId: "string",
            position: 1,
            resourceId: {
              kind: "string",
              videoId: videoIdStub
            }
          },
          contentDetails: {
            videoId: "string",
            startAt: "string",
            endAt: "string",
            note: "string",
            videoPublishedAt: "string"
          },
          status: {
            privacyStatus: "string"
          }
        }
      });

      it('requests that an item be added and returns it', async () => {
        testedYtService.addPlaylistItem(videoIdStub).subscribe(
          (response: PlaylistItem) => {
            expect(response).toBe(postPlaylistItem);
          },
          fail
        );

        const request = httpTestingController.expectOne(POSTurl);
        expect(request.request.method).toEqual('POST');

        const expectedResponse = new HttpResponse(
          {
            status: 200,
            statusText: 'OK',
            body: postPlaylistItem
          }
        );
        request.event(expectedResponse);
      });

      it('requests that an item be added and gets an unauthorized error', async () => {
        let errorText: string;
        testedYtService.addPlaylistItem(videoIdStub).subscribe(
          fail,
          (error: string) => {
            errorText = error;
          }
        );

        const request = httpTestingController.expectOne(POSTurl);
        expect(request.request.method).toEqual('POST');

        const expectedResponseBody = {
          error: {
            error: {
              message: 'Unauthorized'
            }
          }
        };
        const expectedResponse = new HttpErrorResponse(
          {
            status: 401,
            statusText: 'Unauthorized'
          }
        );
        request.flush(expectedResponseBody, expectedResponse);

        expect(errorText).toContain('401');
      });
    });
  });

  describe('DELETE', () => {
    describe('deletePlaylistItem', () => {
      let deletePlaylistItem: PlaylistItem;
      let playlistItemIdStub: string;
      let DELETEurl: string;
      let itemsToDelete: PlaylistItem[];
      let deletedItemCounter: number;

      beforeEach(() => {
        playlistItemIdStub = 'id_stub';
        DELETEurl = ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&id=' + playlistItemIdStub;
        itemsToDelete = [];
        deletePlaylistItem = {
          kind: "string",
          etag: "string",
          id: playlistItemIdStub,
          snippet: {
            publishedAt: "string",
            channelId: "string",
            title: "string",
            description: "string",
            thumbnails: {
              default: {
                url: "string",
                width: 1,
                height: 1
              }
            },
            channelTitle: "string",
            playlistId: "string",
            position: 1,
            resourceId: {
              kind: "string",
              videoId: "string"
            }
          },
          contentDetails: {
            videoId: "string",
            startAt: "string",
            endAt: "string",
            note: "string",
            videoPublishedAt: "string"
          },
          status: {
            privacyStatus: "string"
          }
        };
        deletedItemCounter = 0;
      });

      it('requests that an item be deleted and returns it', () => {
        itemsToDelete.push(deletePlaylistItem);
        testedYtService.deletePlaylistItem(itemsToDelete).subscribe(
          () => {
            ++deletedItemCounter;
          }
        );

        const request = httpTestingController.expectOne(DELETEurl)
        expect(request.request.method).toEqual('DELETE');

        const expectedResponse = new HttpResponse(
          {
            status: 204,
            statusText: 'No Content'
          }
        );
        request.event(expectedResponse);

        expect(deletedItemCounter).toEqual(1);
      });

      it('requests that many items be deleted and returns them', () => {
        for (let i: number = 0; i < 3; ++i) {
          itemsToDelete.push(deletePlaylistItem);
        }
        testedYtService.deletePlaylistItem(itemsToDelete).subscribe(
          () => {
            ++deletedItemCounter;
          }
        );

        const request = httpTestingController.expectOne(DELETEurl);
        expect(request.request.method).toEqual('DELETE');

        const expectedResponse = new HttpResponse(
          {
            status: 204,
            statusText: 'No Content'
          }
        );
        for (let i: number = 0; i < itemsToDelete.length; ++i) {
          request.event(expectedResponse);
        }

        expect(deletedItemCounter).toEqual(itemsToDelete.length);
      });

      it('requests that an item be deleted and get an unauthorized error', () => {
        let errorText: string;
        itemsToDelete.push(deletePlaylistItem);
        testedYtService.deletePlaylistItem(itemsToDelete).subscribe(
          () => {
            ++deletedItemCounter;
          },
          error => {
            errorText = error;
          }
        );

        const request = httpTestingController.expectOne(DELETEurl);
        expect(request.request.method).toEqual('DELETE');

        const expectedResponseBody = {
          error: {
            error: {
              message: 'Unauthorized'
            }
          }
        };
        const expectedErrorResponse = new HttpErrorResponse(
          {
            status: 401,
            statusText: 'Unauthorized'
          }
        );
        request.flush(expectedResponseBody, expectedErrorResponse);

        expect(errorText).toContain('401');
        expect(deletedItemCounter).toEqual(0);
      });
    });
  });
});
