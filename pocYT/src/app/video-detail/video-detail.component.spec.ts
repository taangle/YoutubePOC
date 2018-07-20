import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { Location, DatePipe, formatDate } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { VideoDetailComponent } from './video-detail.component';
import { YtService } from '../yt.service';
import { PlaylistItem } from '../playlistItem';
import { PlaylistItemListResponse } from '../playlistItemListResponse';
import { ActivatedRouteStub } from 'src/test-files/activated-route.stub';
import { FakeYtService } from 'src/test-files/yt.service.fake';

describe('VideoDetailComponent', () => {
  let component: VideoDetailComponent;
  let fixture: ComponentFixture<VideoDetailComponent>;
  let routeStub: ActivatedRouteStub;
  let locationSpy;
  let ytServiceFake: FakeYtService;

  describe('(unit tests)', () => {
    beforeEach(async(() => {
      ytServiceFake = new FakeYtService();
      routeStub = new ActivatedRouteStub();
      routeStub.paramMapValueToReturn = 'initial_stub';
      locationSpy = jasmine.createSpyObj('Location', ['back']);
  
      TestBed.configureTestingModule({
        declarations: [ VideoDetailComponent ],
        schemas: [ NO_ERRORS_SCHEMA ],
        imports: [ RouterTestingModule ],
        providers: [
          {
            provide: YtService,
            useValue: ytServiceFake
          },
          {
            provide: ActivatedRoute,
            useValue: routeStub
          },
          {
            provide: Location,
            useValue: locationSpy
          }
        ]
      }).compileComponents();
  
      fixture = TestBed.overrideComponent(VideoDetailComponent, {
        set: {
          template: '<div></div>'
        }
      }).createComponent(VideoDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }));

    describe('ngOnInit', () => {
      it('calls its own getPlaylistItem', () => {
        spyOn(component, 'getPlaylistItem');
        component.ngOnInit();
        expect(component.getPlaylistItem).toHaveBeenCalled();
      });
    });
  
    describe('getPlaylistItem', () => {
      it('asks ytService for playlist item by id, populates \'item\' with it', fakeAsync(() => {
        let stubId = 'getPlaylistItem_stub_id';
        routeStub.paramMapValueToReturn = stubId;
        let itemToReturn = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
        ytServiceFake.playlistItemToReturn = itemToReturn;
        spyOn(ytServiceFake, 'getPlaylistItem').and.callThrough();
        component.getPlaylistItem();
        tick();
        expect(ytServiceFake.getPlaylistItem).toHaveBeenCalledWith(stubId);
        expect(component.item).toEqual(itemToReturn);
      }));
  
      it('populates error and errorSolution if ytService has a problem', fakeAsync(() => {
        let errorStub = 'error_stub';
        let solutionStub = 'some_solution';
        spyOn(ytServiceFake, 'getPlaylistItem').and.callFake(() => {
          return new Observable((observer) => {
            observer.error(errorStub);
          });
        });
        spyOn(ytServiceFake, 'giveErrorSolution').and.returnValue(solutionStub);
        component.getPlaylistItem();
        tick();
        expect(component.error).toEqual(errorStub);
        expect(component.errorSolution).toEqual(solutionStub);
      }));
    });
  
    describe('goBack', () => {
      it('calls location.back()', () => {
        expect(locationSpy.back).not.toHaveBeenCalled();
        component.goBack();
        expect(locationSpy.back).toHaveBeenCalled();
      });
    });
  
    describe('savePlaylistItem', () => {
      let itemToSave: PlaylistItem;
      let playlistIdStub = 'playlistId_stub';
  
      beforeEach(() => {
        itemToSave = Object.assign({}, ytServiceFake.fixedFakePlaylistItem);
        itemToSave.snippet.playlistId = playlistIdStub;
        component.item = itemToSave;
        spyOn(component, 'goBack');
      });
  
      it('asks ytService to update item', fakeAsync(() => {
        spyOn(ytServiceFake, 'updatePlaylistItem').and.callFake(() => {
          return new Observable();
        });
        component.savePlaylistItem();
        tick();
        expect(ytServiceFake.updatePlaylistItem).toHaveBeenCalledWith(itemToSave);
      }));
  
      it('sets ytService.playlistId if it does not exist, calls goBack', fakeAsync(() => {
        ytServiceFake.playlistId = undefined;
        component.savePlaylistItem();
        tick();
        expect(ytServiceFake.playlistId).toEqual(itemToSave.snippet.playlistId);
        expect(component.goBack).toHaveBeenCalled();
      }));
  
      it('leaves ytService.playlistId alone if it already exists, calls goBack', fakeAsync(() => {
        let differentPlaylistIdStub = 'some_other_id_stub';
        ytServiceFake.playlistId = differentPlaylistIdStub;
        component.savePlaylistItem();
        tick();
        expect(ytServiceFake.playlistId).toEqual(differentPlaylistIdStub);
        expect(component.goBack).toHaveBeenCalled();
      }));
    });
  });

  describe('(DOM)', () => {
    let appElement: HTMLElement;
    let fakePlaylistItemWithDate: PlaylistItem;

    beforeEach(async(() => {
      ytServiceFake = new FakeYtService();
      routeStub = new ActivatedRouteStub();
      routeStub.paramMapValueToReturn = 'initial_stub';
      locationSpy = jasmine.createSpyObj('Location', ['back']);
  
      TestBed.configureTestingModule({
        declarations: [ VideoDetailComponent ],
        schemas: [ NO_ERRORS_SCHEMA ],
        imports: [ RouterTestingModule ],
        providers: [
          {
            provide: YtService,
            useValue: ytServiceFake
          },
          {
            provide: ActivatedRoute,
            useValue: routeStub
          },
          {
            provide: Location,
            useValue: locationSpy
          }
        ]
      }).compileComponents();
  
      fixture = TestBed.createComponent(VideoDetailComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      appElement = fixture.nativeElement;
      fakePlaylistItemWithDate = ytServiceFake.fixedFakePlaylistItem;
      fakePlaylistItemWithDate.snippet.publishedAt = '2013-10-18T14:55:24.000Z'; //DatePipe will throw an error if this field can't be converted to date
    }));

    it('creates toolbar with appropriate text', () => {
      let toolbar = appElement.querySelector('mat-toolbar');

      expect(toolbar.innerHTML).toContain('Video Detail');
    });

    it('does not initially generate cards', () => {
      let noCards = appElement.querySelectorAll('mat-card');

      expect(noCards.length).toEqual(0);
    });

    it('creates card with header, content if item exists', () => {
      component.item = fakePlaylistItemWithDate;
      fixture.detectChanges();

      let detailCard = appElement.querySelector('mat-card');
      let detailCardHeader = detailCard.querySelector('mat-card-header');
      let detailCardContent = detailCard.querySelector('mat-card-content');

      expect(detailCard).toBeTruthy();
      expect(detailCardHeader).toBeTruthy();
      expect(detailCardContent).toBeTruthy();
    });

    it('creates card with header with video title', () => {
      component.item = fakePlaylistItemWithDate;
      fixture.detectChanges();

      let detailCardHeader = appElement.querySelector('mat-card').querySelector('mat-card-header');
      let detailCardHeaderTitle = detailCardHeader.querySelector('mat-card-title');

      expect(detailCardHeaderTitle.innerHTML).toContain(component.item.snippet.title);
    });

    it('creates card with content containing video details and page description', () => {
      component.item = fakePlaylistItemWithDate;
      fixture.detectChanges();

      let detailCardContent = appElement.querySelector('mat-card').querySelector('mat-card-content');
      let detailCardContentDetails = detailCardContent.querySelectorAll('p');
      let videoDescription = detailCardContent.querySelector('pre');
      let videoDescriptionLabel = detailCardContentDetails[0];
      let videoId = detailCardContentDetails[1];
      let playlistItemId = detailCardContentDetails[2];
      let datePublished = detailCardContentDetails[3];
      let playlistAuthor = detailCardContentDetails[4];
      let pageDescription = detailCardContentDetails[5];

      expect(videoDescription.innerHTML).toContain(component.item.snippet.description);
      expect(videoDescriptionLabel.innerHTML).toContain('Description:');
      expect(videoId.innerHTML).toContain('Video ID:');
      expect(videoId.innerHTML).toContain(component.item.snippet.resourceId.videoId);
      expect(playlistItemId.innerHTML).toContain('Unique Item ID:');
      expect(playlistItemId.innerHTML).toContain(component.item.id);
      expect(datePublished.innerHTML).toContain('Added to Playlist on:');
      expect(datePublished.innerHTML).toContain(formatDate(component.item.snippet.publishedAt, 'EEEE, MMMM d, y, h:mm:ss a (zzzz)', 'en-US'));
      expect(playlistAuthor.innerHTML).toContain('Playlist by:');
      expect(playlistAuthor.innerHTML).toContain(component.item.snippet.channelTitle);
      expect(playlistAuthor.innerHTML).toContain(component.item.snippet.channelId);
      expect(pageDescription.innerHTML).toContain('If you\'re signed-in');
    });

    it('creates card with input for updating playlist item position', () => {
      component.item = fakePlaylistItemWithDate;
      fixture.detectChanges();

      let detailCardContent = appElement.querySelector('mat-card').querySelector('mat-card-content');
      let detailCardContentForm = detailCardContent.querySelector('mat-form-field');
      let detailCardContentFormInput = detailCardContentForm.querySelector('input');

      expect(detailCardContentForm).toBeTruthy();
      expect(detailCardContentFormInput.value).toEqual(`${component.item.snippet.position + 1}`);
      expect(detailCardContentFormInput.placeholder).toEqual('New Position');
    });

    it('updates item\'s position when input value is changed', () => {
      component.item = fakePlaylistItemWithDate;
      fixture.detectChanges();

      let detailCardContent = appElement.querySelector('mat-card').querySelector('mat-card-content');
      let detailCardContentInput = detailCardContent.querySelector('input');
      let newPosition = '9';

      detailCardContentInput.value = newPosition;
      detailCardContentInput.dispatchEvent(new Event('input')); //[value] won't change without (input) being triggered
      fixture.detectChanges();
      expect(component.item.snippet.position).toEqual(+newPosition - 1);
    });

    it('calls savePlaylistItem when form is selected and Enter key is pressed', () => {
      component.item = fakePlaylistItemWithDate;
      fixture.detectChanges();

      let detailCardContent = appElement.querySelector('mat-card').querySelector('mat-card-content');
      let detailCardContentForm = detailCardContent.querySelector('mat-form-field');
      spyOn(component, 'savePlaylistItem');

      detailCardContentForm.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Enter' }));
      expect(component.savePlaylistItem).toHaveBeenCalled();
    });

    it('creates Go Back and Save buttons', () => {
      let buttons = appElement.querySelectorAll('button');
      let goBackButton = buttons[0];
      let saveButton = buttons[1];

      expect(goBackButton.innerHTML).toContain('Go Back');
      expect(saveButton.innerHTML).toContain('SAVE');
      expect(saveButton.disabled).toBeTruthy();
    });

    it('triggers goBack when corresponding button is clicked', () => {
      let goBackButton = appElement.querySelectorAll('button')[0];
      spyOn(component, 'goBack');

      goBackButton.click();
      expect(component.goBack).toHaveBeenCalled();
    });

    it('calls savePlaylistItem when Save button is clicked while item exists', () => {
      component.item = fakePlaylistItemWithDate;
      fixture.detectChanges();

      let saveButton = appElement.querySelectorAll('button')[1];
      spyOn(component, 'savePlaylistItem');

      saveButton.click();
      expect(component.savePlaylistItem).toHaveBeenCalled();
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
