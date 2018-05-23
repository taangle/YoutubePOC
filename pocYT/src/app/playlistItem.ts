export class PlaylistItem {

    kind: string; //youtube#playlistItem
    etag: string; //etag
    id: string;
    snippet: {
        publishedAt: string; //datetime
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default: { //only default thumbnail; other resolutions are available
                url: string;
                width: number; //uint
                height: number; //uint
            };
        };
        channelTitle: string;
        playlistId: string;
        position: number; //uint
        resourceId: {
            kind: string; //usually youtube#video
            videoId: string;
        };
    };
    contentDetails: {
        videoId: string;
        startAt: string;
        endAt: string;
        note: string;
        videoPublishedAt: string; //datetime
    };
    status: {
        privacyStatus: string;
    };

}