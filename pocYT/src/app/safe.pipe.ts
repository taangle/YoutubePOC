import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SecurityContext } from '@angular/core';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(url): SafeResourceUrl {
    let safeUrl = url; //this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url);
    if (safeUrl)
      return this.sanitizer.bypassSecurityTrustResourceUrl(safeUrl);
  }

}
