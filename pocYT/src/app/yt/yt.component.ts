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
    playlistItemListResponse: PlaylistItemListResponse;

    constructor(private ytService: YtService) { }

    ngOnInit() {

        this.getPlaylistItems();

    }

    getPlaylistItems(): void {

        this.ytService.getPlaylistItems().subscribe(playlistItemListResponse => { this.playlistItemListResponse = playlistItemListResponse; this.playlistItems = this.playlistItemListResponse.items });

    }

    /*addPlaylistItem(id: string): void {

        id = id.trim();
        if (!id) {
            return;
        }
        this.ytService.addPlaylistItem({ id } as PlaylistItem).subscribe(playlistItem => { this.playlistItems.push(playlistItem) });

    }

    deletePlaylistItem(item: PlaylistItem): void {

        this.playlistItems = this.playlistItems.filter(video => video !== item);
        this.ytService.deletePlaylistItem(item).subscribe();

    }*/

}
