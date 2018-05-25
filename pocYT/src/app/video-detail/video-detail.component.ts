import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { PlaylistItem } from '../playlistItem';
import { YtService } from '../yt.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.css']
})
export class VideoDetailComponent implements OnInit {

    @Input() item: PlaylistItem;

  constructor(private route: ActivatedRoute, private ytService: YtService, private authService: AuthService, private location: Location) { }

  ngOnInit() {

      this.getPlaylistItem();

  }

    //passes a PlaylistItem's ID to a GET request, which returns a PlaylistItemListResponse; first (usually only) element in playlistItemListResponse is stored in item and its info is displayed on page
  getPlaylistItem(): void {

      const id = this.route.snapshot.paramMap.get('id'); //ID also stored in PlaylistItem (i.e. item.id) so it can be pulled from there alternatively
      this.ytService.getPlaylistItem(id).subscribe(playlistItemListResponse => this.item = playlistItemListResponse.items[0]);

  }

  goBack(): void {

      this.location.back();

  }

    //passes the PlaylistItem on the page to a PUT request and returns to main page; currently only allows user to update item's position in playlist
  savePlaylistItem(): void {

      this.ytService.updatePlaylistItem(this.item).subscribe(() => {
          //navigates user back to playlist page if user lands on a detail page independently (without routing)
          if (!this.ytService.playlistId) {
              this.ytService.playlistId = this.item.snippet.playlistId;
          }
          this.goBack();
      }, error => this.ytService.handleAuthError(error));

  }

}