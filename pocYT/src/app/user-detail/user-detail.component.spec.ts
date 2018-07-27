import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UserDetailComponent } from './user-detail.component';
import { AuthService } from 'src/app/auth.service';
import { YtService } from 'src/app/yt.service';
import { FakeYtService } from 'src/test-files/yt.service.fake';
import { PlaylistListResponse } from 'src/app/playlistListResponse';


describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let ytServiceFake: FakeYtService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy;

  describe('(unit tests)', () => {
    beforeEach(async(() => {
      routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      authServiceSpy = jasmine.createSpyObj('AuthService', ['isSignedIn']);
      authServiceSpy.isSignedIn.and.returnValue(false);
      ytServiceFake = new FakeYtService();
  
      TestBed.configureTestingModule({
        declarations: [UserDetailComponent],
        schemas: [ NO_ERRORS_SCHEMA ],
        imports: [  RouterTestingModule ],
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
      });
  
      fixture = TestBed.overrideComponent(UserDetailComponent, {
        set: {
          template: '<div></div>'
        }
      }).createComponent(UserDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }));

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
  
      it('only allows page change once service has completed', fakeAsync(() => {
        spyOn(ytServiceFake, 'getPlaylists').and.returnValue(new Observable((observer) => {
          expect(component.allowPageChangeButtonClick).toBeFalsy();
          observer.next(Object.assign({}, ytServiceFake.fixedFakePlaylistListResponse));
          expect(component.allowPageChangeButtonClick).toBeFalsy();
          observer.complete();
        }));
  
        expect(component.allowPageChangeButtonClick).toBeFalsy();
        component.getPlaylists();
        tick();
        expect(component.allowPageChangeButtonClick).toBeTruthy();
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
  
      it('sets allowPageChangeButtonClick to false', fakeAsync(() => {
        component.allowPageChangeButtonClick = true;
        component.playlistListResponse = Object.assign({}, ytServiceFake.fixedFakePlaylistListResponse);
        component.toPrevPage();
        expect(component.allowPageChangeButtonClick).toBeFalsy();
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
  
      it('sets allowPageChangeButtonClick to false', fakeAsync(() => {
        component.allowPageChangeButtonClick = true;
        component.playlistListResponse = Object.assign({}, ytServiceFake.fixedFakePlaylistListResponse);
        component.toNextPage();
        expect(component.allowPageChangeButtonClick).toBeFalsy();
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

  describe('(DOM)', () => {
    let appElement: HTMLElement;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [UserDetailComponent],
        schemas: [ NO_ERRORS_SCHEMA ],
        imports: [ RouterTestingModule ],
        providers: [
          {
            provide: AuthService,
            useValue: authServiceSpy as AuthService
          },
          {
            provide: YtService,
            useValue: ytServiceFake as YtService
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(UserDetailComponent);
      component = fixture.componentInstance;

      appElement = fixture.nativeElement;
    });

    it('creates toolbar with appropriate text', () => {
      let toolbar = appElement.querySelector('mat-toolbar');

      expect(toolbar.innerHTML).toContain('User Overview');
    });

    it('creates card with default message', () => {
      fixture.detectChanges();

      let defaultCard = appElement.querySelector('mat-card');
      let defaultCardContent = defaultCard.querySelector('mat-card-content');

      expect(defaultCard).toBeTruthy();
      expect(defaultCardContent.innerHTML).toContain('Please sign in');
    });

    it('creates card with header, content when playlists and playlistListResponse exist', () => {
      component.playlistListResponse = ytServiceFake.fixedFakePlaylistListResponse;
      component.playlists = component.playlistListResponse.items;
      fixture.detectChanges();

      let playlistsCard = appElement.querySelector('mat-card')
      let playlistsCardHeader = playlistsCard.querySelector('mat-card-header');
      let playlistsCardContent = playlistsCard.querySelector('mat-card-content');

      expect(playlistsCard).toBeTruthy();
      expect(playlistsCardHeader).toBeTruthy();
      expect(playlistsCardContent).toBeTruthy();
    });

    it('creates card with header with title with total playlist count', () => {
      component.playlistListResponse = ytServiceFake.fixedFakePlaylistListResponse;
      component.playlists = component.playlistListResponse.items;
      fixture.detectChanges();

      let playlistsCardHeader = appElement.querySelector('mat-card').querySelector('mat-card-header');
      let playlistsCardHeaderTitle = playlistsCardHeader.querySelector('mat-card-title');

      expect(playlistsCardHeaderTitle.innerHTML).toContain('Total Playlists:');
      expect(playlistsCardHeaderTitle.innerHTML).toContain(`${component.playlistListResponse.pageInfo.totalResults}`);
    });

    it('creates card with content containing page description', () => {
      component.playlistListResponse = ytServiceFake.fixedFakePlaylistListResponse;
      component.playlists = component.playlistListResponse.items;
      fixture.detectChanges();

      let playlistsCardContent = appElement.querySelector('mat-card').querySelector('mat-card-content');
      let playlistsCardContentDescription = playlistsCardContent.querySelector('p');

      expect(playlistsCardContentDescription.innerHTML).toContain('This is a list of all playlists');
    });

    it('creates card with list of user\'s playlists', () => {
      component.playlistListResponse = ytServiceFake.fixedFakePlaylistListResponse;
      component.playlists = component.playlistListResponse.items;
      fixture.detectChanges();

      let playlistsCardContent = appElement.querySelector('mat-card').querySelector('mat-card-content');
      let playlistsCardContentList = playlistsCardContent.querySelector('mat-list');
      let playlistsCardContentListItems = playlistsCardContentList.querySelectorAll('mat-list-item');

      expect(playlistsCardContentListItems.length).toEqual(component.playlists.length);
    });

    it('displays item titles and creates Play and View/Edit buttons', () => {
      component.playlistListResponse = ytServiceFake.fixedFakePlaylistListResponse;
      component.playlists = component.playlistListResponse.items;
      fixture.detectChanges();

      let playlistsCardContent = appElement.querySelector('mat-card').querySelector('mat-card-content');
      let playlistsCardContentList = playlistsCardContent.querySelector('mat-list');
      let playlistsCardContentListItems = playlistsCardContentList.querySelectorAll('mat-list-item');
      let item = playlistsCardContentListItems[0];
      let itemRouterLink = item.querySelector('a');
      let playlistsCardContentButtons = playlistsCardContent.querySelectorAll('button');
      let itemPlayButton = playlistsCardContentButtons[0];
      let itemViewButton = playlistsCardContentButtons[1];

      expect(itemRouterLink.href).toContain(item.id);
      expect(item.innerHTML).toContain(component.playlists[0].snippet.title);
      expect(itemPlayButton.innerHTML).toContain('\u25BA');
      expect(itemViewButton.innerHTML).toContain('VIEW/EDIT');
    });

    it('calls toPlaylist when View/Edit button is clicked', () => {
      component.playlistListResponse = ytServiceFake.fixedFakePlaylistListResponse;
      component.playlists = component.playlistListResponse.items;
      fixture.detectChanges();

      let playlistsCardContent = appElement.querySelector('mat-card').querySelector('mat-card-content');
      let playlistsCardContentList = playlistsCardContent.querySelector('mat-list');
      let itemViewButton = playlistsCardContent.querySelectorAll('button')[1];
      spyOn(component, 'toPlaylist');

      itemViewButton.click();
      expect(component.toPlaylist).toHaveBeenCalledWith(component.playlists[0].id);
    });

    it('displays and initially disables Previous/Next Page buttons', () => {
      component.playlistListResponse = ytServiceFake.fixedFakePlaylistListResponse;
      component.playlists = component.playlistListResponse.items;
      fixture.detectChanges();

      let playlistsCardContent = appElement.querySelector('mat-card').querySelector('mat-card-content');
      let playlistsCardContentButtons = playlistsCardContent.querySelectorAll('button');
      let previousPageButton = playlistsCardContentButtons[2];
      let nextPageButton = playlistsCardContentButtons[3];

      expect(previousPageButton.disabled).toBeTruthy();
      expect(previousPageButton.innerHTML).toContain('Previous Page');
      expect(nextPageButton.disabled).toBeTruthy();
      expect(nextPageButton.innerHTML).toContain('Next Page');
    });

    it('calls toPlaylist with corresponding playlist ID when View/Edit is clicked', () => {
      component.playlistListResponse = ytServiceFake.fixedFakePlaylistListResponse;
      component.playlists = component.playlistListResponse.items;
      fixture.detectChanges();

      let item = appElement.querySelector('mat-card').querySelector('mat-list').querySelector('mat-list-item');
      let itemViewButton = item.querySelectorAll('button')[1];
      spyOn(component, 'toPlaylist');

      itemViewButton.click();
      expect(component.toPlaylist).toHaveBeenCalledWith(component.playlists[0].id);
    });

    it('calls toPrevPage when corresponding button is clicked, if allowed and token exists', () => {
      component.playlistListResponse = Object.assign({}, ytServiceFake.fixedFakePlaylistListResponse);
      component.playlists = component.playlistListResponse.items;
      fixture.detectChanges();

      let prevPageButton = appElement.querySelector('mat-card').querySelectorAll('button')[2];
      spyOn(component, 'toPrevPage');

      prevPageButton.click();
      expect(component.toPrevPage).not.toHaveBeenCalled();

      component.allowPageChangeButtonClick = true;
      fixture.detectChanges();
      prevPageButton.click();
      expect(component.toPrevPage).not.toHaveBeenCalled();

      component.allowPageChangeButtonClick = false;
      component.playlistListResponse.prevPageToken = 'page_token';
      fixture.detectChanges();
      prevPageButton.click();
      expect(component.toPrevPage).not.toHaveBeenCalled();

      component.allowPageChangeButtonClick = true;
      fixture.detectChanges();
      prevPageButton.click();
      expect(component.toPrevPage).toHaveBeenCalled();
    });

    it('calls toNextPage when corresponding button is clicked, if allowed and token exists', () => {
      component.playlistListResponse = Object.assign({}, ytServiceFake.fixedFakePlaylistListResponse);
      component.playlists = component.playlistListResponse.items;
      fixture.detectChanges();

      let nextPageButton = appElement.querySelector('mat-card').querySelectorAll('button')[3];
      spyOn(component, 'toNextPage');

      nextPageButton.click();
      expect(component.toNextPage).not.toHaveBeenCalled();

      component.allowPageChangeButtonClick = true;
      fixture.detectChanges();
      nextPageButton.click();
      expect(component.toNextPage).not.toHaveBeenCalled();

      component.allowPageChangeButtonClick = false;
      component.playlistListResponse.nextPageToken = 'page_token';
      fixture.detectChanges();
      nextPageButton.click();
      expect(component.toNextPage).not.toHaveBeenCalled();

      component.allowPageChangeButtonClick = true;
      fixture.detectChanges();
      nextPageButton.click();
      expect(component.toNextPage).toHaveBeenCalled();
    });

    it('creates card with header, content when error and errorSolution exist', () => {
      component.error = '404';
      component.errorSolution = 'magic';
      fixture.detectChanges();

      let errorCard = appElement.querySelector('mat-card');
      let errorCardHeader = errorCard.querySelector('mat-card-header');
      let errorCardContent = errorCard.querySelector('mat-card-content');

      expect(errorCard).toBeTruthy();
      expect(errorCardHeader).toBeTruthy();
      expect(errorCardContent).toBeTruthy();
    });

    it('creates card with header with error message', () => {
      component.error = '404';
      component.errorSolution = 'magic';
      fixture.detectChanges();

      let errorCardHeader = appElement.querySelector('mat-card').querySelector('mat-card-header');
      let errorCardHeaderTitle = errorCardHeader.querySelector('mat-card-title');

      expect(errorCardHeaderTitle.innerHTML).toContain('ERROR');
    });

    it('creates card with content containing error and its solution', () => {
      component.error = '404';
      component.errorSolution = 'magic';
      fixture.detectChanges();

      let errorCardContent = appElement.querySelector('mat-card').querySelector('mat-card-content');
      let errorCardContentError = errorCardContent.querySelector('pre');
      let errorCardContentSolution = errorCardContent.querySelector('i');

      expect(errorCardContentError.innerHTML).toContain(component.error);
      expect(errorCardContentSolution.innerHTML).toContain(component.errorSolution);
    });
  });
});
