export class PlaylistItem {

    kind: string;
    etag: string;
    id: string;
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            default: {
                url: string;
                width: number;
                height: number;
            };
        };
        channelTitle: string;
        playlistId: string;
        position: number;
        resourceId: {
            kind: string;
            videoId: string;
        };
    };
    contentDetails: {
        videoId: string;
        startAt: string;
        endAt: string;
        note: string;
        videoPublishedAt: string;
    };
    status: {
        privacyStatus: string;
    };

}