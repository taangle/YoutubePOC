import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { YtComponent } from './yt/yt.component';
import { VideoDetailComponent } from './video-detail/video-detail.component';
import { AuthComponent } from './auth/auth.component';

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, //default
    { path: 'playlist', component: YtComponent }, //main playlist
    { path: 'login', component: AuthComponent }, //sign-in/sign-out
    { path: 'video/:id', component: VideoDetailComponent } //individual video
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class YtRoutingModule { }
