import { Injectable } from '@angular/core';
import { Observable, throwError, from } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, concatMap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { PlaylistItem } from './playlistItem';
import { PlaylistItemListResponse } from './playlistItemListResponse';
import { Playlist } from './playlist';
import { PlaylistListResponse } from './playlistListResponse';

export const httpOptions = {

  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'accessToken'
  })

}

@Injectable({
  providedIn: 'root'
})
export class YtService {

  public playlistId: string; //holds current playlist ID
  public playlistPageToken: string = ''; //holds current page in current list of playlists
  public playlistItemPageToken: string = ''; //holds current page in current playlist
  private ytPlaylistItemsUrl = 'https://www.googleapis.com/youtube/v3/playlistItems'; //API base URL for playlistItem requests
  private ytPlaylistsUrl = 'https://www.googleapis.com/youtube/v3/playlists'; //API base URL for playlist requests
  private apiKey = 'AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc'; //Will's API key
  private maxResults = 50; //results returned per GET request

  constructor(private http: HttpClient, private authService: AuthService) { }

  //gets access token from authService and stores it as an HttpHeader to be used with unauthorized requests while user is signed in to Google/YouTube; clears access token if user has signed out
  setAccessToken(): void {

    try {

      httpOptions.headers = httpOptions.headers.set('Authorization', 'Bearer ' + this.authService.getToken());

    } catch (Error) { //authService throws Error if there is no access token, i.e. user is signed-out

      httpOptions.headers = httpOptions.headers.delete('Authorization');

    }

  }

  //GET request for signed-in user's playlists; can only receive up to 50 Playlists at once
  getPlaylists(): Observable<PlaylistListResponse> {

    this.setAccessToken(); //authorization needed due to "mine" filter in GET request

    //only gets playlists of signed-in user; pageToken not needed for request to be "complete", so keeping the parameter there makes sure user stays on the correct page in user view
    return this.http.get<PlaylistListResponse>(this.ytPlaylistsUrl + '?key=' + this.apiKey + '&part=snippet,status&mine=true&maxResults=' + this.maxResults + '&pageToken=' + this.playlistPageToken, httpOptions).pipe(catchError(this.handleError));

  }

  //GET request for a playlist by ID
  getPlaylist(id: string): Observable<PlaylistListResponse> {

    this.setAccessToken(); //authorization needed for GET request on private playlist (only applicable when user is signed-in)

    //pageToken not needed for request to be "complete", so keeping the parameter there makes sure user stays on the correct page in user view
    return this.http.get<PlaylistListResponse>(this.ytPlaylistsUrl + '?key=' + this.apiKey + '&part=snippet,status&id=' + id + '&pageToken=' + this.playlistPageToken, httpOptions).pipe(catchError(this.handleError));

  }

  //GET request for main playlist; can only receive up to 50 PlaylistItems at once
  getPlaylistItems(playlistId: string): Observable<PlaylistItemListResponse> {

    this.setAccessToken(); //authorization needed for GET request on private playlist (only applicable when user is signed-in)

    //only returns snippet data; pageToken not needed for request to be "complete", so keeping the parameter there makes sure user stays on the correct playlist page
    this.playlistId = playlistId;
    return this.http.get<PlaylistItemListResponse>(this.ytPlaylistItemsUrl + '?key=' + this.apiKey + '&part=snippet&playlistId=' + playlistId + '&maxResults=' + this.maxResults + '&pageToken=' + this.playlistItemPageToken, httpOptions).pipe(catchError(this.handleError));

  }

  //GET request for a PlaylistItem in main playlist using its ID
  getPlaylistItem(id: string): Observable<PlaylistItemListResponse> {

    this.setAccessToken(); //authorization needed for GET request on private playlist items (only applicable when user is signed-in)

    //only returns snippet data
    return this.http.get<PlaylistItemListResponse>(this.ytPlaylistItemsUrl + '?key=' + this.apiKey + '&part=snippet&id=' + id, httpOptions).pipe(catchError(this.handleError));

  }

  //PUT request for existing PlaylistItem
  updatePlaylistItem(item: PlaylistItem): Observable<any> {

    this.setAccessToken();
    
    //currently, only updates item's position; potential to change contentDetails data
    return this.http.put(this.ytPlaylistItemsUrl + '?key=' + this.apiKey + '&part=snippet', {
      "id": item.id,
      "snippet":
        {
          "playlistId": item.snippet.playlistId,
          "position": item.snippet.position,
          "resourceId":
            {
              "kind": "youtube#video",
              "videoId": item.snippet.resourceId.videoId
            }
        }
    }, httpOptions).pipe(catchError(this.handleError));

  }

  //POST request for new PlaylistItem using its video ID
  addPlaylistItem(videoId: string): Observable<PlaylistItem> {

    this.setAccessToken();

    //currently, only adds snippet data; potential to add contentDetails data, status data
    return this.http.post<PlaylistItem>(this.ytPlaylistItemsUrl + '?key=' + this.apiKey + '&part=snippet', {
      "snippet":
        {
          "playlistId": this.playlistId,
          "resourceId":
            {
              "kind": "youtube#video",
              "videoId": videoId
            }
        }
    }, httpOptions).pipe(catchError(this.handleError));

  }

  //DELETE request for existing PlaylistItem using its ID
  deletePlaylistItem(items: PlaylistItem[]): Observable<PlaylistItem> {

    this.setAccessToken();

    //concatenates Observables from each to-be-deleted PlaylistItem in items array; each will be executed in series when subscribed to
    return from(items).pipe(concatMap(item => <Observable<PlaylistItem>>this.http.delete<PlaylistItem>(this.ytPlaylistItemsUrl + '?key=' + this.apiKey + '&id=' + item.id, httpOptions).pipe(catchError(this.handleError))));

  }

  //error handler that provides user-friendly advice/details for common error codes
  giveErrorSolution(error: any): string {

    let errorSolutionText: string;

    if (error.match(/(.*)400(.*)/)) {

      errorSolutionText = 'Please enter a valid value.';

    } else if (error.match(/(.*)401(.*)/)) {

      //checks if user is unauthorized and if an access token exists, i.e. user is signed-in
      if (httpOptions.headers.get('Authorization')) {
        errorSolutionText = 'Please sign in again.';
      } else {
        errorSolutionText = 'You\'re unauthorized to do this; please sign in.';
      }

    } else if (error.match(/(.*)403(.*)/)) {

      errorSolutionText = 'You\'re not allowed to do this.'; //forbidden

    } else if (error.match(/(.*)404(.*)/)) {

      errorSolutionText = 'Try another value.';

    } else {

      errorSolutionText = 'Sorry, something went wrong!';

    }

    return errorSolutionText;

  }

  //error handler that provides status code and message details
  private handleError(error: HttpErrorResponse) {

    let errorText: string;

    if (error.error instanceof ErrorEvent) {

      //client-side error handler
      errorText = error.error.message;

    } else {

      //server-side error handler
      //format is HttpErrorResponse.JSON_response_body.error_field.error_message_field, hence "error.error.error.message"
      errorText = `${error.status} - ${error.error.error.message}`;

    }

    return throwError(errorText);

  }

}
