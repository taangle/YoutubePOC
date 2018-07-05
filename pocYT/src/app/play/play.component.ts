import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit {

  constructor(private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {

    this.getEmbed();

  }

  //pulls playlist ID from route and updates iframe with playlist (which will autoplay and loop back to beginning)
  getEmbed(): void {

    const id = this.route.snapshot.paramMap.get('id');
    let embeddedPlaylist = <HTMLFrameElement>document.getElementById('embeddedPlaylist');
    embeddedPlaylist.src = 'https://www.youtube.com/embed/videoseries?list=' + id + '&autoplay=1&loop=1';

  }

  goBack(): void {

    this.location.back();

  }

}
