import { Component, OnInit } from '@angular/core';

import { YtService } from '../yt.service';
import { PlaylistItem } from '../playlistItem';
import { PlaylistItemListResponse } from '../playlistItemListResponse';

@Component({
  selector: 'app-yt',
  templateUrl: './yt.component.html',
  styleUrls: ['./yt.component.css']
})
export class YtComponent implements OnInit {

    playlistItems: PlaylistItem[];
    //playlistItemListResponse: PlaylistItemListResponse;

    constructor(private ytService: YtService) { }

    ngOnInit() {

        this.getPlaylistItems();

    }

    getPlaylistItems(): void {

        this.ytService.getPlaylistItems().subscribe(playlistItemListResponse => this.playlistItems = playlistItemListResponse.items); //TODO: can't get Observable to map to respective class/interface

    }

}
