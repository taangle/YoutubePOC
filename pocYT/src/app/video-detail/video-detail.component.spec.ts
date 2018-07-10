import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';

import { VideoDetailComponent } from './video-detail.component';
import { YtService } from '../yt.service';
import { PlaylistItem } from '../playlistItem';
import { PlaylistItemListResponse } from '../playlistItemListResponse';

describe('VideoDetailComponent', () => {
  let component: VideoDetailComponent;
  let fixture: ComponentFixture<VideoDetailComponent>;
  let ytServiceSpy: jasmine.SpyObj<YtService>;
  let fakePlaylistItem: PlaylistItem = {
    kind: 'string', //youtube#playlistItem
    etag: 'string', //etag
    id: 'string',
    snippet: {
      publishedAt: '2010-10-10T10:10:10.1Z', //datetime
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
  let fakePlaylistItemListResponse: PlaylistItemListResponse = {
    kind: "kind", //youtube#playlistItemListResponse
    etag: "etag", //etag
    nextPageToken: "next",
    prevPageToken: "prev",
    pageInfo: {
      totalResults: 1, //int
      resultsPerPage: 50 //int
    },
    items: [fakePlaylistItem] //resource array
  };

  function setUpGetPlaylistItem() {

    function subscription(observer) {
      observer.next(fakePlaylistItemListResponse);
      observer.complete();
    }
    ytServiceSpy.getPlaylistItem.and.callFake(() => {
      return new Observable(subscription);
    });

  }

  function setUpUpdatePlaylistItem() {
    function subscription(observer) {
      observer.next(fakePlaylistItem);
      observer.complete();
    }
    ytServiceSpy.updatePlaylistItem.and.callFake(() => {
      return new Observable(subscription);
    });
  }

  beforeEach(async(() => {
    ytServiceSpy = jasmine.createSpyObj('YtService', ['getPlaylistItem', 'updatePlaylistItem', 'giveErrorSolution']);

    setUpGetPlaylistItem();
    setUpUpdatePlaylistItem();

    TestBed.configureTestingModule({
      declarations: [VideoDetailComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: YtService,
          useValue: ytServiceSpy
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.item = fakePlaylistItem;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('has all properties undefined initially', () => {
    expect(component.error).toBeUndefined();
    expect(component.errorSolution).toBeUndefined();
  });

  describe('ngOnInit', () => {

    it('should call service', () => {
      spyOn(component, 'getPlaylistItem');
      component.ngOnInit();
      expect(component.getPlaylistItem).toHaveBeenCalled();
    });

  });

  describe('getPlaylistItem', () => {

    it('should call service', () => {
      component.getPlaylistItem();
      expect(ytServiceSpy.getPlaylistItem).toHaveBeenCalled();
      expect(component.item).toEqual(fakePlaylistItem);
    });

  });

  xdescribe('*PENDING* goBack', () => {
  });

  describe('savePlaylistItem', () => {

    it('should call service', () => {
      component.getPlaylistItem();
      component.savePlaylistItem();
      expect(ytServiceSpy.updatePlaylistItem).toHaveBeenCalledWith(component.item);
    });

  });

});
