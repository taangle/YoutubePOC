import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { PlaylistItem } from './playlistItem';
import { PlaylistItemListResponse } from './playlistItemListResponse';

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
    public pageToken: string = ''; //holds current page in current playlist
    private ytUrl = 'https://www.googleapis.com/youtube/v3/playlistItems'; //API base URL for playlistItem requests

    constructor(private http: HttpClient, private authService: AuthService) { }

    //gets access token from authService and stores it as an HttpHeader to be used with non-GET requests while user is signed in to Google/YouTube; clears access token if user has signed out
    setAccessToken(): void {

        try {

            httpOptions.headers = httpOptions.headers.set('Authorization', 'Bearer ' + this.authService.getToken());

        } catch (Error) { //authService throws Error if there is no access token, i.e. user is signed-out

            httpOptions.headers = httpOptions.headers.delete('Authorization');
            console.error('Please sign in');

        }

    }

    //GET request for main playlist; can only receive up to 50 PlaylistItems at once
    getPlaylistItems(playlistId: string): Observable<PlaylistItemListResponse> {

        //currently, only returns snippet data; pageToken not needed for request to be "complete", so keeping the parameter there makes sure user stays on the correct playlist page
        return this.http.get<PlaylistItemListResponse>(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet&playlistId=' + playlistId + '&maxResults=50&pageToken=' + this.pageToken).pipe(catchError(this.handleError));

    }

    //GET request for a PlaylistItem in main playlist using its ID
    getPlaylistItem(id: string): Observable<PlaylistItemListResponse> {

        //currently, only returns snippet data
        return this.http.get<PlaylistItemListResponse>(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet&id=' + id).pipe(catchError(this.handleError));

    }

    //PUT request for existing PlaylistItem
    updatePlaylistItem(item: PlaylistItem): Observable<any> {

        this.setAccessToken();

        //currently, only updates item's position; potential to change contentDetails data
        return this.http.put(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet', {
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
        return this.http.post<PlaylistItem>(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet', {
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
    deletePlaylistItem(id: string): Observable<PlaylistItem> {

        this.setAccessToken();

        //deletes from any playlist (if user has proper permissions) since ID is unique to each PlaylistItem
        return this.http.delete<PlaylistItem>(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&id=' + id, httpOptions).pipe(catchError(this.handleError));

    }

    //requires user to sign in if a token has been set but they are still unauthorized (e.g. wrong user, token expiration)
    handleAuthError(error: any): void {

        //checks if user is unauthorized and if an access token exists, i.e. user is signed-in
        if (error == 401 && httpOptions.headers.get('Authorization')) {

            console.error('You\'re either unauthorized to edit this playlist or your access has expired; please sign in with the correct YouTube account.');

        }

    }

    //console error handler
    private handleError(error: HttpErrorResponse) {

        if (error.error instanceof ErrorEvent) {

            //client-side error handler
            console.error('An error occurred:', error.error.message);

        } else {

            //server-side error handler
            console.error(`Backend returned code ${error.status}: ${error.error.error.message}`); //format is HttpErrorResponse.JSON_response_body.error_field.error_message_field

        }

        return throwError(`${error.status}`);

    }

}