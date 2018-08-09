import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { YtComponent } from './yt/yt.component';
import { VideoDetailComponent } from './video-detail/video-detail.component';
import { AuthComponent } from './auth/auth.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { PlayComponent } from './play/play.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // default
  { path: 'playlist', component: YtComponent }, // main playlist
  { path: 'login', component: AuthComponent }, // sign-in/sign-out
  { path: 'video/:id', component: VideoDetailComponent }, // individual video
  { path: 'user', component: UserDetailComponent }, // user view
  { path: 'play/:id', component: PlayComponent }, // playlist play view
  { path: '**', redirectTo: 'login' } // all non-existent routes are redirected to login page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class YtRoutingModule { }
