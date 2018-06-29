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
    error: string;
  errorSolution: string;
  itemsToDelete: PlaylistItem[] = [];
  shouldDelete: boolean[] = [false, false, false, false, false, false, false, false, false, false,
                              false, false, false, false, false, false, false, false, false, false,
                              false, false, false, false, false, false, false, false, false, false,
                              false, false, false, false, false, false, false, false, false, false,
                              false, false, false, false, false, false, false, false, false, false];

    constructor(private ytService: YtService, private gapiService: GoogleApiService) {

        this.gapiService.onLoad().subscribe(); //I don't quite know what this does so it could be removed

    }

    // If ytService has a current playlist, populate fields with it when component loads
    ngOnInit() {

        if (this.ytService.playlistId) {
          this.getPlaylistItems(this.ytService.playlistId);
        }

    }

    // Asks ytService for playlist to populate playlistItemListResponse and playlistItems
    getPlaylistItems(playlistId: string): void {

        playlistId = playlistId.trim();
        if (!playlistId) {
            return;
        }

        this.ytService.getPlaylistItems(playlistId).subscribe(playlistItemListResponse => {
            this.playlistItemListResponse = playlistItemListResponse;
            this.playlistItems = this.playlistItemListResponse.items;
        }, error => {
            this.errorSolution = this.ytService.giveErrorSolution(error);
            this.error = error;
        });

    }

    // Asks ytService to add an item, updates fields manually if at < 50 items, otherwise gets the actual playlist from ytService
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
        }, error => {
            this.errorSolution = this.ytService.giveErrorSolution(error);
            this.error = error;
        });

    }

    // Asks ytService to delete item, updates fields manually if at < 50 items, otherwise gets the actual playlist from ytService
    deletePlaylistItem(): void {

      this.itemsToDelete = [];
      for (let i in this.shouldDelete) {
        if (this.playlistItems[i] && this.shouldDelete[i]) {
          this.itemsToDelete.push(this.playlistItems[i]);
        }
      }
      if (this.itemsToDelete.length == 0) {
        return;
      }

      for (let item of this.itemsToDelete) {
        this.ytService.deletePlaylistItem(item.id).subscribe(() => {
          //not all requests go through this way; test if you can chain/concat a bunch of observables in case it's the API stopping frequent requests?
        }, error => {
            this.errorSolution = this.ytService.giveErrorSolution(error);
            this.error = error;
        });
      }
      this.getPlaylistItems(this.ytService.playlistId);

      /*this.ytService.deletePlaylistItem(item).subscribe(() => {
            /*if (this.playlistItems.length >= 50) {
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
        }, error => {
            this.errorSolution = this.ytService.giveErrorSolution(error);
            this.error = error;
        });*/

    }

    // Gives ytService the pageToken then asks ytService for the playlist
    toPrevPage(): void {
        this.ytService.pageToken = this.playlistItemListResponse.prevPageToken;
        this.getPlaylistItems(this.ytService.playlistId);
    }

    // Gives ytService the pageToken then asks ytService for the playlist
    toNextPage(): void {
        this.ytService.pageToken = this.playlistItemListResponse.nextPageToken;
        this.getPlaylistItems(this.ytService.playlistId);
    }

    clearErrors(): void {

        this.error = null;
        this.errorSolution = null;

  }

  toggleToDelete(index: number): void {

    this.shouldDelete[index] = !this.shouldDelete[index];

  }

}
