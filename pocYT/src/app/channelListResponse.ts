import { Channel } from './channel';

export class ChannelListResponse {
  
      kind: string; //youtube#playlistItemListResponse
      etag: string; //etag
      nextPageToken: string;
      prevPageToken: string;
      pageInfo: {
          totalResults: number; //int
          resultsPerPage: number; //int
      };
      items: Channel[]; //resource array
  
  }