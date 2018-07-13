import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

import { YtComponent } from './yt.component';
import { GoogleApiService } from "ng-gapi";
import { YtService } from '../yt.service';
import { PlaylistItem } from '../playlistItem';
import { PlaylistItemListResponse } from '../playlistItemListResponse';
import { FakeYtService } from 'src/test-files/yt.service.fake';

describe('YtComponent', () => {
  let component: YtComponent;
  let fixture: ComponentFixture<YtComponent>;
  let ytServiceFake: FakeYtService;

  beforeEach(async(() => {
    ytServiceFake = new FakeYtService();

    //#region Configure TestBed and get component instance
    TestBed.configureTestingModule({
      declarations: [YtComponent],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatToolbarModule,
        MatCardModule,
        MatListModule,
        MatInputModule,
        MatCheckboxModule,
        MatDividerModule
      ],
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
      it('does not ask service for playlist', () => {
        spyOn(component, 'getPlaylistItems');
        expect(component.getPlaylistItems).not.toHaveBeenCalled();
      });
    });

    describe('(when ytService has a playlistId)', () => {
      it('asks service for playlsit', () => {
        spyOn(component, 'getPlaylistItems');
        ytServiceFake.playlistId = ytServiceFake.playlistIdStub;
        component.ngOnInit();
        expect(component.getPlaylistItems).toHaveBeenCalledWith(ytServiceFake.playlistId);
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

      let urlStub = 'https://www.youtube.com/watch?v=vYb4_ARPNfo&list=PLWQB0T3rGCzEPRWOqrfSrJW_-A7RsT4qS&index=2&t=0s';
      let actualVideoId = 'vYb4_ARPNfo';
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

    it('updates fields once the item is added (length == 50)', fakeAsync(() => {
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

    it('updates fields once the item is added (length > 50)', fakeAsync(() => {
      let origLength: number = 4999;
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
      let origLength: number = 1;
      ytServiceFake.fakeCloudPlaylist = new Array<PlaylistItem>(origLength);
      ytServiceFake.fakeCloudPlaylist[origLength - 1] = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist.slice();
      ytServiceFake.playlistItemListResponseToReturn.pageInfo = { totalResults: origLength, resultsPerPage: 50 };
      ytServiceFake.playlistItemToAdd = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();

      component.addPlaylistItem(ytServiceFake.videoIdStub);
      tick();

      expect(component.playlistItems.length).toBe(origLength + 1);
      expect(component.playlistItems).toContain(ytServiceFake.playlistItemToAdd);
    }));

    it('updates fields once the item is added (length == 0)', fakeAsync(() => {
      ytServiceFake.fakeCloudPlaylist = new Array<PlaylistItem>();
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.itemsInPlaylistItemListResponseToReturnSliceOf = ytServiceFake.fakeCloudPlaylist;
      ytServiceFake.playlistItemToAdd = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();

      component.addPlaylistItem(ytServiceFake.videoIdStub);
      tick();

      expect(component.playlistItems.length).toBe(1);
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

  describe('deletePlaylistItems & toggleToDelete', () => {
    beforeEach(fakeAsync(() => {
      // populate fakeCloudPlaylist with filled fake items
      let fakeCloudPlaylist: PlaylistItem[] = new Array<PlaylistItem>(10);
      for (let i = 0; i < fakeCloudPlaylist.length; i++) {
        fakeCloudPlaylist[i] = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
        fakeCloudPlaylist[i].id = i.toString();
      }
      ytServiceFake.fakeCloudPlaylist = fakeCloudPlaylist;

      // populate component's fields
      ytServiceFake.playlistItemListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItemListResponse);
      ytServiceFake.playlistItemListResponseToReturn.items = ytServiceFake.fakeCloudPlaylist;
      component.getPlaylistItems(ytServiceFake.playlistIdStub);
      tick();
    }));

    it('asks service to delete array of PlaylistItems that have been toggled to delete', fakeAsync(() => {
      let indexesToDeleteAt: number[];
      let expectedItemsToHaveBeenCalledWith: PlaylistItem[];
      let deleteSpy = spyOn(ytServiceFake, 'deletePlaylistItem').and.returnValue(new Observable());

      expectedItemsToHaveBeenCalledWith = new Array<PlaylistItem>();
      indexesToDeleteAt = [0];
      indexesToDeleteAt.forEach((i) => {
        component.toggleToDelete(i);
        expectedItemsToHaveBeenCalledWith.push(component.playlistItems[i]);
      });
      component.deletePlaylistItems();
      tick();
      indexesToDeleteAt.forEach((i) => {
        expect(deleteSpy.calls.mostRecent().args[0]).toContain(ytServiceFake.fakeCloudPlaylist[i]);
      });

      expectedItemsToHaveBeenCalledWith = new Array<PlaylistItem>();
      indexesToDeleteAt = [0, 2, 5, 9];
      indexesToDeleteAt.forEach((i) => {
        component.toggleToDelete(i);
        expectedItemsToHaveBeenCalledWith.push(component.playlistItems[i]);
      });
      component.deletePlaylistItems();
      tick();
      indexesToDeleteAt.forEach((i) => {
        expect(deleteSpy.calls.mostRecent().args[0]).toContain(ytServiceFake.fakeCloudPlaylist[i]);
      });

      expectedItemsToHaveBeenCalledWith = new Array<PlaylistItem>();
      indexesToDeleteAt = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      indexesToDeleteAt.forEach((i) => {
        component.toggleToDelete(i);
        expectedItemsToHaveBeenCalledWith.push(component.playlistItems[i]);
      });
      component.deletePlaylistItems();
      tick();
      indexesToDeleteAt.forEach((i) => {
        expect(deleteSpy.calls.mostRecent().args[0]).toContain(ytServiceFake.fakeCloudPlaylist[i]);
      });
    }));

    it('does not ask service to delete anything if nothing has been marked for deletion', fakeAsync(() => {
      spyOn(ytServiceFake, 'deletePlaylistItem').and.returnValue(new Observable());

      component.deletePlaylistItems();
      tick();

      expect(ytServiceFake.deletePlaylistItem).not.toHaveBeenCalled();
    }));

    it('updates fields once service completes action', fakeAsync(() => {
      ytServiceFake.playlistId = ytServiceFake.playlistIdStub;
      spyOn(component, 'getPlaylistItems');

      component.toggleToDelete(0);
      component.deletePlaylistItems();
      tick();

      expect(component.getPlaylistItems).toHaveBeenCalledWith(ytServiceFake.playlistIdStub);
    }));

    it('allows items to be toggled back and forth before actual deletion', fakeAsync(() => {
      let indexesToDeleteAt: number[];
      let indexesToNotDeleteAt: number[];
      let expectedItemsToHaveBeenCalledWith: PlaylistItem[];
      let deleteSpy = spyOn(ytServiceFake, 'deletePlaylistItem').and.returnValue(new Observable());

      expectedItemsToHaveBeenCalledWith = new Array<PlaylistItem>();
      indexesToDeleteAt = [0, 3, 5, 9];
      indexesToNotDeleteAt = [1, 8];
      indexesToDeleteAt.forEach((i) => {
        component.toggleToDelete(i);
        expectedItemsToHaveBeenCalledWith.push(component.playlistItems[i]);
      });
      component.toggleToDelete(0); component.toggleToDelete(0); component.toggleToDelete(0); component.toggleToDelete(0);
      component.toggleToDelete(1); component.toggleToDelete(1);
      component.toggleToDelete(9);
      component.toggleToDelete(8);
      component.toggleToDelete(9);
      component.toggleToDelete(8);
      component.deletePlaylistItems();
      tick();
      indexesToDeleteAt.forEach((i) => {
        expect(deleteSpy.calls.mostRecent().args[0]).toContain(ytServiceFake.fakeCloudPlaylist[i]);
      });
      indexesToNotDeleteAt.forEach((i) => {
        expect(deleteSpy.calls.mostRecent().args[0]).not.toContain(ytServiceFake.fakeCloudPlaylist[i]);
      });
    }));

    it('populates error and errorSolution if ytService has a problem', fakeAsync(() => {
      let errorStub = 'delete_error_stub';
      let solutionStub = 'delete_solution_stub';
      spyOn(ytServiceFake, 'deletePlaylistItem').and.returnValue(new Observable((observer) => {
        observer.error(errorStub);
      }));
      spyOn(ytServiceFake, 'giveErrorSolution').and.returnValue(solutionStub);
      component.toggleToDelete(0); component.toggleToDelete(9);
      component.deletePlaylistItems();
      tick();
      expect(component.error).toEqual(errorStub);
      expect(component.errorSolution).toEqual(solutionStub);
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
