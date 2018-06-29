export class Playlist {

  kind: string; //youtube#playlist
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
    tags: string[];
    defaultLanguage: string;
    localized: {
      title: string;
      description: string;
    };
  };
  status: {
    privacyStatus: string;
  };
  contentDetails: {
    itemCount: number; //uint
  };
  player: {
    embedHtml: string;
  };
  localizations: {
    languageCode: { //only default language; other languages are available
      title: string;
      description: string;
    };
  };

}
