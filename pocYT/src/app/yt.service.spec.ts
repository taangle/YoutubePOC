import { TestBed, inject } from '@angular/core/testing';

import { YtService } from './yt.service';

describe('YtService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [YtService]
    });
  });

  xit('*PENDING* should be created (requires HTTP mocking)', inject([YtService], (service: YtService) => {
    expect(service).toBeTruthy();
  }));
});
