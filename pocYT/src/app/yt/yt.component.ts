import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { YtService } from '../yt.service';
import { PlaylistItem } from '../playlistItem';
import { PlaylistItemListResponse } from '../playlistItemListResponse';
import { Playlist } from '../playlist';
import { PlaylistListResponse } from '../playlistListResponse';

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
  currentPlaylist: Playlist;
  playlistListResponse: PlaylistListResponse;
  error: string;
  errorSolution: string;
  allowPageChangeButtonClick: boolean = false;
  allowDeleteButtonClick: boolean = false;

  constructor(private ytService: YtService) { }

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

    playlistId = this.parseId(playlistId, this.ytPlaylistDelimiter);

    this.ytService.getPlaylistItems(playlistId).subscribe(playlistItemListResponse => {
      this.playlistItemListResponse = playlistItemListResponse;
      this.playlistItems = this.playlistItemListResponse.items;
    }, error => {
      this.ytService.playlistId = ''; //stops ytService from holding on to junk playlist IDs
      this.setError(error);
    }, () => {
      this.allowDeleteButtonClick = true;
      this.allowPageChangeButtonClick = true;
    });

    //this GET request exists to obtain info not included in a PlaylistItemListResponse, i.e. playlist name, playlist privacy status
    this.ytService.getPlaylist(playlistId).subscribe(playlistListResponse => {
      this.playlistListResponse = playlistListResponse;
      this.currentPlaylist = this.playlistListResponse.items.length === 0 ? null : this.playlistListResponse.items[0];
    }, error => {
      console.error(error); //getPlaylistItems should produce the same errors so it will update the error/errorSolution strings; this is a placeholder
    });

  }

  // Asks ytService to add an item, updates fields manually if at < 50 items, otherwise gets the actual playlist from ytService
  addPlaylistItem(videoId: string): void {

    videoId = videoId.trim();
    if (!videoId) {
      return;
    }

    videoId = this.parseId(videoId, this.ytVideoDelimiter);

    this.ytService.addPlaylistItem(videoId).subscribe(playlistItem => {
      //max display is 50 PlaylistItems, so this shouldn't display a new video entry if it is added to the end of a 50+-video playlist
      if (this.playlistItems.length < 50 && this.playlistItems.length > 0) {
        this.updateDisplayWithNewVideo(playlistItem);
      } else {
        this.getPlaylistItems(this.ytService.playlistId); //has to refresh display list if adding to full page; makes another GET call
      }
    }, error => {
        this.setError(error);
    });

  }

  // Asks ytService to delete array of items marked for deletion, then gets the playlist from ytService
  deletePlaylistItems(): void {

    this.populateItemsToDelete();
    //returns if user never marked any playlistItems for deletion
    if (this.itemsToDelete.length == 0) {
      return;
    }

    this.allowDeleteButtonClick = false;
    this.ytService.deletePlaylistItem(this.itemsToDelete).subscribe(() => {
        console.log("yt.component: item successfully deleted"); //currently, no "loading" indicator so this just prints to the console for each successful delete
    }, error => {
        this.allowDeleteButtonClick = true;
        this.setError(error);
      }, () => {
        this.getPlaylistItems(this.ytService.playlistId); //makes another GET call to refresh display after all marked playlistItems are deleted
        this.shouldDelete = new Array(50).fill(false); //resets deletion flags
      }
    );
  }

  // Gives ytService the pageToken then asks ytService for the playlist
  toPrevPage(): void {
    this.shouldDelete.fill(false);
    this.allowPageChangeButtonClick = false;
    this.ytService.playlistItemPageToken = this.playlistItemListResponse.prevPageToken;
    this.getPlaylistItems(this.ytService.playlistId);
  }

  // Gives ytService the pageToken then asks ytService for the playlist
  toNextPage(): void {
    this.shouldDelete.fill(false);
    this.allowPageChangeButtonClick = false;
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

  clearPageToken(): void {

    this.ytService.playlistItemPageToken = '';

  }

  private setError(error) {

    this.errorSolution = this.ytService.giveErrorSolution(error);
    this.error = error;

  }

  private parseId(id: string, delimiter: string) {

    this.splitUrl = [];
    let newId = id;
    this.splitUrl = newId.split(delimiter);
    if (this.splitUrl[0] !== newId) {
      this.splitUrl = this.splitUrl[1].split('&');
      newId = this.splitUrl[0];
    }
    return newId;

  }

  private updateDisplayWithNewVideo(playlistItem: PlaylistItem) {

    playlistItem.snippet.position = this.playlistItems[this.playlistItems.length - 1].snippet.position + 1; //updates position since returned playlistItem has none initially
    this.playlistItems.push(playlistItem);
    this.playlistItemListResponse.pageInfo.totalResults += 1; //updates display total to reflect actual total

  }

  private populateItemsToDelete() {

    this.itemsToDelete = []; //resets array of items marked for deletion
    for (let i in this.playlistItems) {
      //adds playlistItem to itemsToDelete if the corresponding index in shouldDelete is true, then changes element at that index back to false
      if (this.shouldDelete[i]) {
        this.itemsToDelete.push(this.playlistItems[i]);
      }
    }

  }

}
