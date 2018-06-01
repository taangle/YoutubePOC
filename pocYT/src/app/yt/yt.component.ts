import { Component, OnInit } from '@angular/core';

import { YtService } from '../yt.service';
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

    constructor(private ytService: YtService, private gapiService: GoogleApiService) {

        this.gapiService.onLoad().subscribe(); //I don't quite know what this does so it could be removed

    }

    ngOnInit() {

        //on first load (when there is no set playlist to display), nothing displays until Show Playlist is clicked
        if (this.ytService.playlistId) {
            this.getPlaylistItems(this.ytService.playlistId);
        }

    }

    //GET request, which returns a PlaylistItemListResponse; playlistItemListResponse.items is stored in playlistItems and its elements are displayed on page
    getPlaylistItems(playlistId: string): void {

        playlistId = playlistId.trim();
        if (!playlistId) {
            return;
        }

        this.ytService.getPlaylistItems(playlistId).subscribe(playlistItemListResponse => {
            this.playlistItemListResponse = playlistItemListResponse;
            this.playlistItems = this.playlistItemListResponse.items;
            this.ytService.playlistId = playlistId; //waits for valid response, and then stores given playlist ID
        });

    }

    //passes a new video ID to a POST request, which returns a PlaylistItem; playlistItem is added to end of playlist
    addPlaylistItem(videoId: string): void {

        videoId = videoId.trim();
        if (!videoId) {
            return;
        }

        this.ytService.addPlaylistItem(videoId).subscribe(playlistItem => {
            //max display is 50 PlaylistItems, so this shouldn't display a new video entry if it is added to the end of a 50+-video playlist
            if (this.playlistItems.length < 50) {
                playlistItem.snippet.position = this.playlistItems[this.playlistItems.length - 1].snippet.position + 1; //updates position since returned playlistItem has none initially
                this.playlistItems.push(playlistItem);
                this.playlistItemListResponse.pageInfo.totalResults += 1; //updates display total to reflect actual total
            } else {
                this.getPlaylistItems(this.ytService.playlistId); //has to refresh display list if adding to full page; currently, makes another GET call
            }
        }, error => this.ytService.handleAuthError(error));

    }

    //passes a PlaylistItem to a DELETE request, which returns a PlaylistItem; playlist has playlistItem filtered from it to reflect deletion
    deletePlaylistItem(item: PlaylistItem): void {

        this.ytService.deletePlaylistItem(item.id).subscribe(() => {
            if (this.playlistItems.length >= 50) {
                this.getPlaylistItems(this.ytService.playlistId); //has to refresh display list if deleting from full page; currently, makes another GET call
            } else {
                this.playlistItems = this.playlistItems.filter(video => video !== item);
                this.playlistItemListResponse.pageInfo.totalResults -= 1; //updates display total to reflect actual total
                let pageIndex: number = this.playlistItemListResponse.pageInfo.totalResults - this.playlistItems.length;
                for (let i: number = 0; i < this.playlistItems.length; ++i) {
                    this.playlistItems[i].snippet.position = pageIndex; //updates display list numbers without doing another GET call
                    pageIndex++;
                }
            }
        }, error => this.ytService.handleAuthError(error));

    }

    //saves pageToken and moves to previous playlist page
    toPrevPage(): void {

        this.ytService.pageToken = this.playlistItemListResponse.prevPageToken;
        this.ytService.getPlaylistItems(this.ytService.playlistId).subscribe(playlistItemListResponse => {
            this.playlistItemListResponse = playlistItemListResponse;
            this.playlistItems = this.playlistItemListResponse.items;
        });

    }

    //saves pageToken and moves to next playlist page
    toNextPage(): void {

        this.ytService.pageToken = this.playlistItemListResponse.nextPageToken;
        this.ytService.getPlaylistItems(this.ytService.playlistId).subscribe(playlistItemListResponse => {
            this.playlistItemListResponse = playlistItemListResponse;
            this.playlistItems = this.playlistItemListResponse.items;
        });

    }

}
