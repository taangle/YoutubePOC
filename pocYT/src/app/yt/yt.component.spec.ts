import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';

import { YtComponent } from './yt.component';
import { GoogleApiService } from "ng-gapi";
import { YtService } from '../yt.service';
import { PlaylistItem } from '../playlistItem';
import { PlaylistItemListResponse } from '../playlistItemListResponse';
import { FakeYtService } from 'src/test-files/yt.service.fake';

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

    it('calls ytService with given playlistId input and update playlistItemListResponse and playlistItems', fakeAsync(() => {
      let expectedResponse = new PlaylistItemListResponse();
      ytServiceFake.playlistItemListResponseToReturn = expectedResponse;
      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      expect(getPlaylistItemsSpy).toHaveBeenCalledWith(ytServiceFake.playlistIdStub);
      expect(component.playlistItemListResponse).toEqual(expectedResponse);

      let idStub = 'PLWQB0T3rGCzEPRWOqrfSrJW_-A7RsT4qS     ';
      let actualId = 'PLWQB0T3rGCzEPRWOqrfSrJW_-A7RsT4qS';
      expectedResponse = new PlaylistItemListResponse();
      ytServiceFake.playlistItemListResponseToReturn = expectedResponse;
      component.getPlaylistItems(idStub);
      tick();
      expect(getPlaylistItemsSpy).toHaveBeenCalledWith(actualId);
      expect(component.playlistItemListResponse).toEqual(expectedResponse);

      idStub = '      PLWQB0T3rGCzEPRWOqrfSrJW_-A7RsT4qS';
      expectedResponse = new PlaylistItemListResponse();
      ytServiceFake.playlistItemListResponseToReturn = expectedResponse;
      component.getPlaylistItems(idStub);
      tick();
      expect(getPlaylistItemsSpy).toHaveBeenCalledWith(actualId);
      expect(component.playlistItemListResponse).toEqual(expectedResponse);

      idStub = '  \t    PLWQB0T3rGCzEPRWOqrfSrJW_-A7RsT4qS              ';
      expectedResponse = new PlaylistItemListResponse();
      ytServiceFake.playlistItemListResponseToReturn = expectedResponse;
      component.getPlaylistItems(idStub);
      tick();
      expect(getPlaylistItemsSpy).toHaveBeenCalledWith(actualId);
      expect(component.playlistItemListResponse).toEqual(expectedResponse);

      idStub = '\r\nPLWQB0T3rGCzEPRWOqrfSrJW_-A7RsT4qS\r\n\t';
      expectedResponse = new PlaylistItemListResponse();
      ytServiceFake.playlistItemListResponseToReturn = expectedResponse;
      component.getPlaylistItems(idStub);
      tick();
      expect(getPlaylistItemsSpy).toHaveBeenCalledWith(actualId);
      expect(component.playlistItemListResponse).toEqual(expectedResponse);
    }));

    it('calls ytService with correct playlistId when given playlist URL', fakeAsync(() => {
      let urlStub = ' \r  https://youtube.com/playlist?list=PLWQB0T3rGCzEPRWOqrfSrJW_-A7RsT4qS&app=desktop  \n ';
      let expectedId = 'PLWQB0T3rGCzEPRWOqrfSrJW_-A7RsT4qS';
      let expectedResponse = new PlaylistItemListResponse();
      ytServiceFake.playlistItemListResponseToReturn = expectedResponse;
      component.getPlaylistItems(urlStub);
      tick();
      expect(getPlaylistItemsSpy).toHaveBeenCalledWith(expectedId);
      expect(component.playlistItemListResponse).toEqual(expectedResponse);

      urlStub = '   \t   https://www.youtube.com/playlist?list=PLWQB0T3rGCzHKoCUvt2g5uGGD5fYVywbt   ';
      expectedId = 'PLWQB0T3rGCzHKoCUvt2g5uGGD5fYVywbt';
      expectedResponse = new PlaylistItemListResponse();
      ytServiceFake.playlistItemListResponseToReturn = expectedResponse;
      component.getPlaylistItems(urlStub);
      tick();
      expect(getPlaylistItemsSpy).toHaveBeenCalledWith(expectedId);
      expect(component.playlistItemListResponse).toEqual(expectedResponse);

      urlStub = '   youtube.com/playlist?list=PLWQB0T3rGCzHXgO11UaJ1akGYPAMaZ44f\t   \n';
      expectedId = 'PLWQB0T3rGCzHXgO11UaJ1akGYPAMaZ44f';
      expectedResponse = new PlaylistItemListResponse();
      ytServiceFake.playlistItemListResponseToReturn = expectedResponse;
      component.getPlaylistItems(urlStub);
      tick();
      expect(getPlaylistItemsSpy).toHaveBeenCalledWith(expectedId);
      expect(component.playlistItemListResponse).toEqual(expectedResponse);

      urlStub = '  \t\rlist=PLWQB0T3rGCzHXgO11UaJ1akGYFJ58BJHDU\t   \n';
      expectedId = 'PLWQB0T3rGCzHXgO11UaJ1akGYFJ58BJHDU';
      expectedResponse = new PlaylistItemListResponse();
      ytServiceFake.playlistItemListResponseToReturn = expectedResponse;
      component.getPlaylistItems(urlStub);
      tick();
      expect(getPlaylistItemsSpy).toHaveBeenCalledWith(expectedId);
      expect(component.playlistItemListResponse).toEqual(expectedResponse);
    }));

    it('populates error and errorSolution if ytService has a problem', fakeAsync(() => {
      let errorStub = 'error_stub';
      let solutionStub = 'solution_stub';
      getPlaylistItemsSpy.and.callFake((str) => {
        return new Observable((observer) => {
          observer.error(errorStub);
        });
      });
      ytServiceFake.errorSolution = solutionStub;
      spyOn(ytServiceFake, 'giveErrorSolution').and.callThrough();

      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      expect(component.error).toEqual(errorStub);
      expect(component.errorSolution).toEqual(solutionStub);
      expect(ytServiceFake.giveErrorSolution).toHaveBeenCalledWith(errorStub);
    }));
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

      let videoIdStub = 'vYb4_ARPNfo';
      let actualVideoId = 'vYb4_ARPNfo';
      component.addPlaylistItem(videoIdStub);
      tick();
      expect(addPlaylistItemSpy).toHaveBeenCalledWith(actualVideoId);

      videoIdStub = '         \n\r\t\r    vYb4_ARPNfo       \t\n\r';
      component.addPlaylistItem(videoIdStub);
      tick();
      expect(addPlaylistItemSpy).toHaveBeenCalledWith(actualVideoId);
    }));

    it('asks service to add item with correct id given video URL', fakeAsync(() => {
      ytServiceFake.fakeCloudPlaylist = new Array<PlaylistItem>(50);
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist;
      ytServiceFake.playlistItemToAdd = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();

      let  urlStub = 'https://www.youtube.com/watch?v=vYb4_ARPNfo&list=PLWQB0T3rGCzEPRWOqrfSrJW_-A7RsT4qS&index=2&t=0s';
      let  actualVideoId = 'vYb4_ARPNfo';
      component.addPlaylistItem(urlStub);
      tick();
      expect(addPlaylistItemSpy).toHaveBeenCalledWith(actualVideoId);

      urlStub = '         \n\r\t\r    https://www.youtube.com/watch?v=vYb4_ARPNfo&list=PLWQB0T3rGCzEPRWOqrfSrJW_-A7RsT4qS&index=2&t=0s       \t\n\r';
      component.addPlaylistItem(urlStub);
      tick();
      expect(addPlaylistItemSpy).toHaveBeenCalledWith(actualVideoId);

      urlStub = '         \n\r\t\r    youtube.com/watch?v=vYb4_ARPNfo&list=PLWQB0T3rGCzEPRWOqrfSrJW_-A7RsT4qS&index=2&t=0s       \t\n\r';
      component.addPlaylistItem(urlStub);
      tick();
      expect(addPlaylistItemSpy).toHaveBeenCalledWith(actualVideoId);

      urlStub = '         \n\r\t\r    youtube.com/watch?v=vYb4_ARPNfo       \t\n\r';
      component.addPlaylistItem(urlStub);
      tick();
      expect(addPlaylistItemSpy).toHaveBeenCalledWith(actualVideoId);

      urlStub = '         \n\r\t\r    v=vYb4_ARPNfo       \t\n\r';
      component.addPlaylistItem(urlStub);
      tick();
      expect(addPlaylistItemSpy).toHaveBeenCalledWith(actualVideoId);
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

    it('populates error and errorSolution if ytService has a problem', fakeAsync(() => {
      ytServiceFake.fakeCloudPlaylist = new Array<PlaylistItem>(50);
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist;
      ytServiceFake.playlistItemToAdd = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();

      let errorStub = 'error_stub';
      let solutionStub = 'solution_stub';
      ytServiceFake.errorSolution = solutionStub;
      addPlaylistItemSpy.and.callFake((str) => {
        return new Observable((observer) => {
          observer.error(errorStub);
        });
      });
      spyOn(ytServiceFake, 'giveErrorSolution').and.callThrough();
      component.addPlaylistItem(ytServiceFake.videoIdStub);
      tick();
      expect(component.error).toEqual(errorStub);
      expect(component.errorSolution).toEqual(solutionStub);
      expect(ytServiceFake.giveErrorSolution).toHaveBeenCalledWith(errorStub);
    }));
  });

  describe('deletePlaylistItems', () => {
    let items: PlaylistItem[];

    beforeEach(() => {
      items = new Array<PlaylistItem>(5);
      for (let i = 0; i < items.length; i++) {
        items[i] = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
      }
      ytServiceFake.fakeCloudPlaylist = items;
    });

    it('asks service to delete a playlist of items', fakeAsync(() => {
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
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist;
      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      spyOn(ytServiceFake, 'deletePlaylistItem').and.returnValue(new Observable());

      component.deletePlaylistItems();
      tick();
      expect(ytServiceFake.deletePlaylistItem).not.toHaveBeenCalled();
    }));

    it('updates fields once service completes action', fakeAsync(() => {
      ytServiceFake.playlistId = ytServiceFake.playlistIdStub;
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist;
      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
      spyOn(component, 'getPlaylistItems');

      console.log("~~fake cloud PL: " + JSON.stringify(ytServiceFake.fakeCloudPlaylist));
      component.toggleToDelete(0);
      component.deletePlaylistItems();
      tick();
      console.log("~~fake cloud PL: " + JSON.stringify(ytServiceFake.fakeCloudPlaylist));
      expect(component.playlistItemListResponse).toEqual(ytServiceFake.playlistItemListResponseToReturn);
      expect(component.playlistItems).toEqual(ytServiceFake.playlistItemListResponseToReturn.items);
      expect(component.getPlaylistItems).toHaveBeenCalledWith(ytServiceFake.playlistIdStub);
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
