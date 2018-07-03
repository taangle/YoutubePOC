import { Playlist } from './playlist';

export class PlaylistListResponse {

  kind: string; //youtube#playlistListResponse
  etag: string; //etag
  nextPageToken: string;
  prevPageToken: string;
  pageInfo: {
    totalResults: number; //int
    resultsPerPage: number; //int
  };
  items: Playlist[]; //resource array

}
