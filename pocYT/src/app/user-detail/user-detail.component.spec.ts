import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { UserDetailComponent } from './user-detail.component';
import { AuthService } from 'src/app/auth.service';
import { YtService } from 'src/app/yt.service';
import { Router } from '@angular/router';
import { FakeYtService } from 'src/test-files/yt.service.fake';
import { tick } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { PlaylistListResponse } from 'src/app/playlistListResponse';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let ytServiceFake: FakeYtService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy;

  beforeEach(async(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isSignedIn']);
    authServiceSpy.isSignedIn.and.returnValue(false);
    ytServiceFake = new FakeYtService();

    TestBed.configureTestingModule({
      declarations: [UserDetailComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceSpy as AuthService
        },
        {
          provide: YtService,
          useValue: ytServiceFake as YtService
        },
        {
          provide: Router,
          useValue: routerSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('is created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      spyOn(component, 'getPlaylists');
    });

    it('gets playlists if user is authenticated', () => {
      authServiceSpy.isSignedIn.and.returnValue(true);
      component.ngOnInit();
      expect(component.getPlaylists).toHaveBeenCalled();
    });

    it('does not get playlists if user is not authenticated', () => {
      authServiceSpy.isSignedIn.and.returnValue(false);
      expect(component.getPlaylists).not.toHaveBeenCalled();
    });
  });

  describe('getPlaylists', () => {
    it('asks ytService for playlists', fakeAsync(() => {
      ytServiceFake.playlistListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistListResponse);
      ytServiceFake.playlistListResponseToReturn.items = [Object.assign({}, ytServiceFake.fixedFakePlaylist)];
      spyOn(ytServiceFake, 'getPlaylists').and.callThrough();
      component.getPlaylists();
      tick();
      expect(ytServiceFake.getPlaylists).toHaveBeenCalled();
    }));

    it('populates playlistListResponse and playlists', fakeAsync(() => {
      ytServiceFake.playlistListResponseToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistListResponse);
      ytServiceFake.playlistListResponseToReturn.items = [Object.assign({}, ytServiceFake.fixedFakePlaylist)];
      spyOn(ytServiceFake, 'getPlaylists').and.callThrough();
      component.getPlaylists();
      tick();
      expect(component.playlistListResponse).toBe(ytServiceFake.playlistListResponseToReturn);
      expect(component.playlists).toBe(ytServiceFake.playlistListResponseToReturn.items);
    }));

    it('populates error and errorSolution if something goes wrong with ytService', fakeAsync(() => {
      let errorMessage: string = 'solution';
      ytServiceFake.errorSolution = 'solution';
      spyOn(ytServiceFake, 'getPlaylists').and.callFake(() => {
        return new Observable((observer) => {
          observer.error(errorMessage);
        });
      });
      component.getPlaylists();
      tick();
      expect(component.error).toEqual(errorMessage);
      expect(component.errorSolution).toEqual(ytServiceFake.errorSolution);
    }));
  });

  describe('toPlaylist', () => {
    it('sets ytService.playlistItemPageToken to blank if the provided playlistId does not match the current ytService.playlistId', fakeAsync(() => {
      ytServiceFake.playlistItemPageToken = 'page_token_stub';
      ytServiceFake.playlistId = 'some_id';
      component.toPlaylist('some_other_id');
      tick();
      expect(ytServiceFake.playlistItemPageToken).toEqual('');
    }));

    it('sets ytService.playlistId', fakeAsync(() => {
      ytServiceFake.playlistItemPageToken = 'page_token_stub';
      ytServiceFake.playlistId = 'some_id';
      component.toPlaylist('some_other_id');
      tick();
      expect(ytServiceFake.playlistId).toEqual('some_other_id');
    }));

    it('asks router to navigate to playlist url', fakeAsync(() => {
      ytServiceFake.playlistItemPageToken = 'page_token_stub';
      ytServiceFake.playlistId = 'some_id';
      component.toPlaylist('some_other_id');
      tick();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/playlist']);
    }));
  });

  describe('toPrevPage', () => {
    let prevPageTokenStub: string;
    beforeEach(() => {
      spyOn(component, 'getPlaylists');
      prevPageTokenStub = 'prev_page_token_stub';
      component.playlistListResponse = new PlaylistListResponse();
      component.playlistListResponse.prevPageToken = prevPageTokenStub;
    });

    it('sets ytService.playlistPageToken to the response\'s prevPageToken', fakeAsync(() => {
      component.toPrevPage();
      tick();
      expect(ytServiceFake.playlistPageToken).toEqual(prevPageTokenStub);
    }));

    it('gets playlists from service', fakeAsync(() => {
      component.toPrevPage();
      tick();
      expect(component.getPlaylists).toHaveBeenCalled();
    }));
  });

  describe('toNextPage', () => {
    let nextPageTokenStub: string;
    beforeEach(() => {
      spyOn(component, 'getPlaylists');
      nextPageTokenStub = 'next_page_token_stub';
      component.playlistListResponse = new PlaylistListResponse();
      component.playlistListResponse.nextPageToken = nextPageTokenStub;
    });

    it('sets ytService.playlistPageToken to the response\'s nextPageToken', fakeAsync(() => {
      component.toNextPage();
      tick();
      expect(ytServiceFake.playlistPageToken).toEqual(nextPageTokenStub);
    }));

    it('gets playlists from service', fakeAsync(() => {
      component.toNextPage();
      tick();
      expect(component.getPlaylists).toHaveBeenCalled();
    }));
  });

  describe('clearErrors', () => {
    it('sets error and errorSolution to null', () => {
      component.error = 'some_error';
      component.errorSolution = 'some_solution';
      component.clearErrors();
      expect(component.error).toBeNull();
      expect(component.errorSolution).toBeNull();
    });
  });
});
