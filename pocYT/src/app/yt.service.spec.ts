import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { YtService } from './yt.service';
import { AuthService } from './auth.service';

describe('YtService', () => {
  let ytService: YtService;

  beforeEach(() => {
    let authServiceSpy = jasmine.createSpyObj('AuthService', ['signIn', 'getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        YtService,
        {
          provide: AuthService,
          useValue: authServiceSpy
        }
      ]
    });


  });

  it('should be created', () => {
    ytService = TestBed.get(YtService);
    expect(ytService).toBeTruthy();
  });
});
