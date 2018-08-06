import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { YtService } from '../yt.service';
import { Playlist } from '../playlist';
import { PlaylistListResponse } from '../playlistListResponse';
import { ChannelListResponse } from 'src/app/channelListResponse';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {

  playlists: Playlist[];
  playlistListResponse: PlaylistListResponse;
  currentChannelTitle: string;
  error: string;
  errorSolution: string;
  allowPageChangeButtonClick: boolean = false;

  constructor(private authService: AuthService, private ytService: YtService, private router: Router) { }

  // Gets playlists if authService reports that user is authenticated
  ngOnInit() {

    //checks if user is signed-in; if so, gets a list of their playlists
    if (this.authService.isSignedIn()) {
      this.getPlaylists();
      this.currentChannelTitle = this.ytService.lastChannelTitle;
    }
    else {
      this.currentChannelTitle = null;
    }

  }

  //gets signed-in user's playlists from ytService
  getPlaylists(): void {

    this.ytService.getPlaylists().subscribe(playlistListResponse => {
      this.playlistListResponse = playlistListResponse;
      this.playlists = this.playlistListResponse.items;
    }, error => {
      this.setError(error);
    }, () => {
      this.allowPageChangeButtonClick = true;
    });

  }

  //sets current playlistId in ytService and redirects to ytComponent, which will display playlistItems in the playlist with the aforementioned playlistId
  toPlaylist(playlistId: string): void {

    //clears page token from previous playlist to prevent it from getting passed to GET call for a new playlist
    if (playlistId !== this.ytService.playlistId) {
      this.ytService.playlistItemPageToken = '';
    }
    this.ytService.playlistId = playlistId;
    this.router.navigate(['/playlist']);

  }

  // Gives ytService the pageToken then asks ytService for the next page of playlists
  toPrevPage(): void {
    this.allowPageChangeButtonClick = false;
    this.ytService.playlistPageToken = this.playlistListResponse.prevPageToken;
    this.getPlaylists();
  }

  // Gives ytService the pageToken then asks ytService for the previous page of playlists
  toNextPage(): void {
    this.allowPageChangeButtonClick = false;
    this.ytService.playlistPageToken = this.playlistListResponse.nextPageToken;
    this.getPlaylists();
  }

  clearErrors(): void {

    this.error = null;
    this.errorSolution = null;

  }

  private setError(error) {

    this.errorSolution = this.ytService.giveErrorSolution(error);
    this.error = error;

  }
}
