import { SafePipe } from './safe.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('SafePipe', () => {
  let sanitizerSpy;

  beforeEach(() => {
    sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
  });

  it('asks DomSanitizer to transform a string into a SafeResourceUrl', () => {
    const pipe = new SafePipe(sanitizerSpy);
    let str = 'string';
    pipe.transform(str);
    expect(sanitizerSpy.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(str);
  });
});
