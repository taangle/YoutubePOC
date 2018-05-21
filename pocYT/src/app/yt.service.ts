import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, tap, retry } from 'rxjs/operators';

import { PlaylistItem } from './playlistItem';
import { PlaylistItemListResponse } from './playlistItemListResponse';

const httpOptions = {

    //TODO: figure out authorization
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        //'Authorization': 'Bearer '
    })

}

@Injectable({
  providedIn: 'root'
})
export class YtService {

    private ytUrl = 'https://www.googleapis.com/youtube/v3/playlistItems'; //API URL

    constructor(private http: HttpClient) { }

    //get main playlist
    getPlaylistItems(): Observable<PlaylistItemListResponse> {

        return this.http.get<PlaylistItemListResponse>(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet&playlistId=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG&maxResults=50').pipe(catchError(this.handleError)); //fixed to one playlist

    }

    //GET
    getPlaylistItem(id: string): Observable<PlaylistItemListResponse> {

        return this.http.get<PlaylistItemListResponse>(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet&id=' + id).pipe(catchError(this.handleError));

    }

    //PUT
    /*updatePlaylistItem(item: PlaylistItem): Observable<any> {

        return this.http.put(this.ytUrl + '?key=AIzaSyDmBnFCo-4j1EN9-ZCf_RZtgds-Eeweqoc&part=snippet');

    }

    //POST
    addPlaylistItem(item: PlaylistItem): Observable<PlaylistItem> {



    }

    //DELETE
    deletePlaylistItem(item: PlaylistItem | string): Observable<PlaylistItem> {



    }*/

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError(
            'Something bad happened; please try again later.');
    }

}
