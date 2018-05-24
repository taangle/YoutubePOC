import { Component, OnInit } from '@angular/core';

import { YtService } from '../yt.service';
import { AuthService } from '../auth.service';
import { GoogleApiService } from "ng-gapi";
import { PlaylistItem } from '../playlistItem';
import { PlaylistItemListResponse } from '../playlistItemListResponse';

@Component({
  selector: 'app-yt',
  templateUrl: './yt.component.html',
  styleUrls: ['./yt.component.css']
})
export class YtComponent implements OnInit {

    playlistItems: PlaylistItem[];
    playlistItemListResponse: PlaylistItemListResponse;

    constructor(private ytService: YtService, private authService: AuthService, private gapiService: GoogleApiService) {

        this.gapiService.onLoad().subscribe(); //I don't quite know what this does so it could be removed

    }

    ngOnInit() {

        if (this.ytService.playlistId) {
            this.getPlaylistItems(this.ytService.playlistId);
        }

    }

    //GET request, which returns a PlaylistItemListResponse; playlistItemListResponse.items is stored in playlistItems and its elements are displayed on page
    getPlaylistItems(id: string): void {

        this.ytService.getPlaylistItems(id).subscribe(playlistItemListResponse => {
            this.playlistItemListResponse = playlistItemListResponse;
            this.playlistItems = this.playlistItemListResponse.items;
            this.ytService.playlistId = id;
        });

    }

    //passes a new video ID to a POST request, which returns a PlaylistItem; playlistItem is added to end of playlist
    addPlaylistItem(id: string): void {

        id = id.trim();
        if (!id) {
            return;
        }

        this.ytService.addPlaylistItem(id).subscribe(playlistItem => {
            //max display is 50 PlaylistItems, so this shouldn't display a new video entry if it is added to the end of a 50+-video playlist
            if (this.playlistItems.length < 50) {
                this.playlistItems.push(playlistItem);
            }
        });

    }

    //passes a PlaylistItem to a DELETE request, which returns a PlaylistItem; playlist has playlistItem filtered from it to reflect deletion
    deletePlaylistItem(item: PlaylistItem): void {

        this.ytService.deletePlaylistItem(item.id).subscribe(playlistItem => {
            //has to refresh display list if playlist has 50+ videos; currently, makes another GET call
            if (this.playlistItems.length >= 50) {
                this.getPlaylistItems(this.ytService.playlistId);
            } else {
                this.playlistItems = this.playlistItems.filter(video => video !== item);
            }
        });

    }

}
