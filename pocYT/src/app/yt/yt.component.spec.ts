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
        MatCheckboxModule
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
