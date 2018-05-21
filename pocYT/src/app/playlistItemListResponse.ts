import { PlaylistItem } from './playlistItem';

export class PlaylistItemListResponse {

    kind: string; //youtube#playlistItemListResponse
    etag: string; //etag
    nextPageToken: string;
    prevPageToken: string;
    pageInfo: {
        totalResults: number; //int
        resultsPerPage: number; //int
    };
    items: PlaylistItem[];

}