import { TestBed, inject } from '@angular/core/testing';

import { YtService } from './yt.service';

describe('YtService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [YtService]
    });
  });

  it('should be created', inject([YtService], (service: YtService) => {
    expect(service).toBeTruthy();
  }));
});
