import { YtRoutingModule, routes } from './yt-routing.module';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { AuthComponent } from 'src/app/auth/auth.component';
import { PlayComponent } from 'src/app/play/play.component';
import { UserDetailComponent } from 'src/app/user-detail/user-detail.component';
import { VideoDetailComponent } from 'src/app/video-detail/video-detail.component';
import { YtComponent } from 'src/app/yt/yt.component';
import { SafePipe } from 'src/app/safe.pipe';

describe('YtRoutingModule', () => {
    let location: Location;
    let router: Router;
    let fixture;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes(routes)],
        declarations: [
          AppComponent,
          AuthComponent,
          PlayComponent,
          UserDetailComponent,
          VideoDetailComponent,
          YtComponent,
          SafePipe
        ]
      });

      router = TestBed.get(Router);
      fixture = TestBed.createComponent(AppComponent)
      router.initialNavigation();
    });

    xit('*PENDING* redirects "" to /login', fakeAsync(() => {
      router.navigate(['']);
      tick();
      expect(location.pathname).toBe('/login');
    }));
});
