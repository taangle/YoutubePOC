import { YtRoutingModule } from './yt-routing.module';

describe('YtRoutingModule', () => {
    let ytRoutingModule: YtRoutingModule;

    beforeEach(() => {
        ytRoutingModule = new YtRoutingModule();
    });

  it('is created', () => {
    expect(ytRoutingModule).toBeTruthy();
  });
});
