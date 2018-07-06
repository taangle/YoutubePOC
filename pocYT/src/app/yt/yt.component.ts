import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { YtService } from '../yt.service';
import { PlaylistItem } from '../playlistItem';
import { PlaylistItemListResponse } from '../playlistItemListResponse';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-yt',
  templateUrl: './yt.component.html',
  styleUrls: ['./yt.component.css']
})
export class YtComponent implements OnInit {

  private splitUrl: string[];
  private ytPlaylistDelimiter: string = 'list=';
  private ytVideoDelimiter: string = 'watch?v=';
  private itemsToDelete: PlaylistItem[] = [];
  //keeps track of which playlistItems have been marked for deletion by index
  private shouldDelete: boolean[] = new Array(50).fill(false);

  playlistItems: PlaylistItem[];
  playlistItemListResponse: PlaylistItemListResponse;
  error: string;
  errorSolution: string;

  constructor(private ytService: YtService) { }

  // If ytService has a current playlist, populate fields with it when component loads
  ngOnInit() {

    if (this.ytService.playlistId) {
      this.getPlaylistItems(this.ytService.playlistId);
    }

  }

  // Asks ytService for playlist to populate playlistItemListResponse and playlistItems
  getPlaylistItems(playlistId: string): void {
    console.log("~~component.getPlaylistItems called with: " + playlistId);
    
    playlistId = playlistId.trim();
    if (!playlistId) {
      return;
    }

    this.splitUrl = [];
    this.splitUrl = playlistId.split(this.ytPlaylistDelimiter);
    if (this.splitUrl[0] !== playlistId) {
      this.splitUrl = this.splitUrl[1].split('&');
      playlistId = this.splitUrl[0];
    }

    this.ytService.getPlaylistItems(playlistId).subscribe(playlistItemListResponse => {
      console.log("~~getPlaylistItems subscription fulfilled: " + playlistItemListResponse)
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

    this.splitUrl = [];
    this.splitUrl = videoId.split(this.ytVideoDelimiter);
    if (this.splitUrl[0] !== videoId) {
      this.splitUrl = this.splitUrl[1].split('&');
      videoId = this.splitUrl[0];
    }

    this.ytService.addPlaylistItem(videoId).subscribe(playlistItem => {
      //max display is 50 PlaylistItems, so this shouldn't display a new video entry if it is added to the end of a 50+-video playlist
      // if (this.playlistItems.length < 50 && this.playlistItems.length > 0) {
      //   playlistItem.snippet.position = this.playlistItems[this.playlistItems.length - 1].snippet.position + 1; //updates position since returned playlistItem has none initially
      //   this.playlistItems.push(playlistItem);
      //   this.playlistItemListResponse.pageInfo.totalResults += 1; //updates display total to reflect actual total
      // } else {
      //   this.getPlaylistItems(this.ytService.playlistId); //has to refresh display list if adding to full page; makes another GET call
      // }
      this.getPlaylistItems(this.ytService.playlistId);
    }, error => {
      this.errorSolution = this.ytService.giveErrorSolution(error);
      this.error = error;
    });

  }

  // Asks ytService to delete array of items marked for deletion, then gets the playlist from ytService
  deletePlaylistItems(): void {

    this.itemsToDelete = []; //resets array of items marked for deletion
    for (let i in this.playlistItems) {
      //adds playlistItem to itemsToDelete if the corresponding index in shouldDelete is true, then changes element at that index back to false
      if (this.shouldDelete[i]) {
        this.itemsToDelete.push(this.playlistItems[i]);
        this.shouldDelete[i] = false;
      }
    }
    //returns if user never marked any playlistItems for deletion
    if (this.itemsToDelete.length == 0) {
      return;
    }

    this.ytService.deletePlaylistItem(this.itemsToDelete).subscribe(() => {
        console.log("success"); //currently, no "loading" indicator so this just prints to the console for each successful delete
      }, error => {
        this.errorSolution = this.ytService.giveErrorSolution(error);
        this.error = error;
      }, () => {
        this.getPlaylistItems(this.ytService.playlistId); //makes another GET call to refresh display after all marked playlistItems are deleted
      }
    );
  }

  // Gives ytService the pageToken then asks ytService for the playlist
  toPrevPage(): void {
    this.ytService.playlistItemPageToken = this.playlistItemListResponse.prevPageToken;
    this.getPlaylistItems(this.ytService.playlistId);
  }

  // Gives ytService the pageToken then asks ytService for the playlist
  toNextPage(): void {
    this.ytService.playlistItemPageToken = this.playlistItemListResponse.nextPageToken;
    this.getPlaylistItems(this.ytService.playlistId);
  }

  clearErrors(): void {

    this.error = null;
    this.errorSolution = null;

  }

  //toggles a playlistItem's future deletion status; index of shouldDelete should match index of to-be-deleted playlistItem in playlistItems array
  toggleToDelete(index: number): void {

    this.shouldDelete[index] = !this.shouldDelete[index];

  }

  callGet() { //~~
    this.getPlaylistItems(this.ytService.playlistId);
  }

  getService(): YtService { //~~
    return this.ytService;
  }

}
