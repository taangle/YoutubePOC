import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit {

  // This url is not necessarily safe; potential XSS vulnerability
  public embedUrl: string = 'https://www.youtube.com/embed/vYb4_ARPNfo?list=PLWQB0T3rGCzEPRWOqrfSrJW_-A7RsT4qS';

  constructor(private route: ActivatedRoute, private location: Location) { }

  ngOnInit() {

    this.getEmbed();

  }

  //pulls playlist ID from route and updates iframe with playlist (which will autoplay and loop back to beginning)
  private getEmbed(): void {

    const playlistId = this.route.snapshot.paramMap.get('id');
    this.embedUrl = 'https://www.youtube.com/embed/videoseries?list=' + playlistId + '&autoplay=1&loop=1';

  }

  goBack(): void {

    this.location.back();

  }

}
