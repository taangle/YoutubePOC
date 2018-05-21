import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { PlaylistItem } from '../playlistItem';
import { YtService } from '../yt.service';

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.css']
})
export class VideoDetailComponent implements OnInit {

    @Input() item: PlaylistItem;

  constructor(private route: ActivatedRoute, private ytService: YtService, private location: Location) { }

  ngOnInit() {

      this.getPlaylistItem();

  }

  getPlaylistItem(): void {

      const id = this.route.snapshot.paramMap.get('id');
      this.ytService.getPlaylistItem(id).subscribe(playlistItemListResponse => this.item = playlistItemListResponse.items[0]);

  }

  goBack(): void {

      this.location.back();

  }

  /*savePlaylistItem(): void {

      this.ytService.updatePlaylistItem(this.item).subscribe(() => this.goBack());

  }*/

}
