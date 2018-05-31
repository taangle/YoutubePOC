import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { YtService, httpOptions } from './yt.service';
import { AuthService } from './auth.service';
import { PlaylistItemListResponse } from './playlistItemListResponse';
import { PlaylistItem } from './playlistItem';

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

    it('calls the authService signIn if getToken throws error', () => {
      authServiceSpy.getToken.and.throwError("error");
      testedYtService.setAccessToken();
      expect(authServiceSpy.signIn).toHaveBeenCalled();
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
      let expectedPlaylistItemResponse: PlaylistItem;
      let unexpectedPlaylistItemResponse;
      let playlistItemIdStub = "playlist_item_id";
      let GETPlayistItemUrl = ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet&id=' + playlistItemIdStub;

    });
  });

  describe('PUT', () => {

  });

  describe('POST', () => {

  });

  describe('DELETE', () => [

  ])
});
