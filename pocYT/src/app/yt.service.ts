import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap, retry } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { PlaylistItem } from './playlistItem';
import { PlaylistItemListResponse } from './playlistItemListResponse';

const httpOptions = {

    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'accessToken'
    })

}

@Injectable({
  providedIn: 'root'
})
export class YtService {

    private ytUrl = 'https://www.googleapis.com/youtube/v3/playlistItems'; //API base URL for playlistItem requests

    constructor(private http: HttpClient, private authService: AuthService) { }

    //gets access token from authService and stores it as an HttpHeader to be used with non-GET requests while user is signed in to Google/YouTube; prompts user to sign in if they are unauthenticated
    setAccessToken(): void {

        try {

            httpOptions.headers = httpOptions.headers.set('Authorization', 'Bearer ' + this.authService.getToken()); //currently, no sign-in button and no way to sign out

        } catch (Error) { //authService throws Error if there is no access token

            this.authService.signIn(); //currently, Error still shows up in console the first time this happens and the user must click their button again after signing in

        }

    }

    //GET request for main playlist; can only receive up to 50 PlaylistItems at once
    getPlaylistItems(): Observable<PlaylistItemListResponse> {

        //currently, only displays one playlist, cannot display videos beyond initial 50, and only returns snippet data
        return this.http.get<PlaylistItemListResponse>(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet&playlistId=PLT102V9pILBXPp5OU4jI05YLcFpTYtx0h&maxResults=50').pipe(catchError(this.handleError));

    }

    //GET request for a PlaylistItem in main playlist using its ID
    getPlaylistItem(id: string): Observable<PlaylistItemListResponse> {

        //currently, only returns snippet data
        return this.http.get<PlaylistItemListResponse>(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet&id=' + id).pipe(catchError(this.handleError));

    }

    //PUT request for existing PlaylistItem
    updatePlaylistItem(item: PlaylistItem): Observable<any> {

        //currently, only updates item's position; potential to change contentDetails data
        return this.http.put(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet', {
            "id": item.id,
            "snippet":
            {
                "playlistId": "PLT102V9pILBXPp5OU4jI05YLcFpTYtx0h",
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
    addPlaylistItem(id: string): Observable<PlaylistItem> {

        //currently, only adds to one playlist and only adds snippet data; potential to add contentDetails data, status data
        return this.http.post<PlaylistItem>(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet', {
            "snippet":
            {
                "playlistId": "PLT102V9pILBXPp5OU4jI05YLcFpTYtx0h",
                "resourceId": 
                {
                    "kind": "youtube#video",
                    "videoId": id
                }
            }
        }, httpOptions).pipe(catchError(this.handleError));

    }

    //DELETE request for existing PlaylistItem using its ID
    deletePlaylistItem(id: string): Observable<PlaylistItem> {

        //deletes from any playlist (if user has proper permissions) since ID is unique to each PlaylistItem
        return this.http.delete<PlaylistItem>(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&id=' + id, httpOptions).pipe(catchError(this.handleError));

    }

    //this error handler does not/cannot return the actual message body of the error
    private handleError(error: HttpErrorResponse) {

        if (error.error instanceof ErrorEvent) {

            //client-side error handler
            console.error('An error occurred:', error.error.message);

        } else {

            //server-side error handler
            switch (error.status) {

                case 400: {
                    console.error(`Backend returned code ${error.status}: Invalid Entry`);
                    break;
                }
                case 401: {
                    console.error(`Backend returned code ${error.status}: Unauthorized`);
                    break;
                }
                case 403: {
                    console.error(`Backend returned code ${error.status}: Forbidden`);
                    break;
                }
                case 404: {
                    console.error(`Backend returned code ${error.status}: Not Found`);
                    break;
                }
                default: {
                    console.error(`Backend returned code ${error.status}; body was: ${error.error.message}`);
                    break;
                }

            }

        }

        return throwError('Something bad happened; please try again later.');

    }

}
