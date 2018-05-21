import { YtRoutingModule } from './yt-routing.module';

describe('YtRoutingModule', () => {
  let ytRoutingModule: YtRoutingModule;

  beforeEach(() => {
    ytRoutingModule = new YtRoutingModule();
  });

  it('should create an instance', () => {
    expect(ytRoutingModule).toBeTruthy();
  });
});
