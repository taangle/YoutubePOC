export class PlaylistItem {

    /*kind: string; //youtube#playlistItem
    etag: number; //etag
    id: string;
    snippetPublishedAt: string; //datetime
    snippetChannelId: string;
    snippetTitle: string;
    snippetDescription: string;
    snippetThumbnailsKeyUrl: string;
    snippetThumbnailsKeyWidth: number; //uint
    snippetThumbnailsKeyHeight: number; //uint
    snippetChannelTitle: string;
    snippetPlaylistId: string;
    snippetPosition: number; //uint
    snippetResourceIdKind: string;
    snippetResourceIdVideoId: string;
    snippetContentDetailsVideoId: string;
    snippetContentDetailsStartAt: string;
    snippetContentDetailsEndAt: string;
    snippetContentDetailsNote: string;
    snippetContentDetailsVideoPublishedAt: string; //datetime
    statusPrivacyStatus: string;*/

    kind: string;
    etag: string;
    id: string;
    snippet: {
        publishedAt: string;
        channelId: string;
        title: string;
        description: string;
        thumbnails: {
            (key): {
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