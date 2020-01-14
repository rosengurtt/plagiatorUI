import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})



export class SongsRepositoryService {
    private songLibraryUrl = 'http://localhost:9001/api/';

    constructor(private http: HttpClient) { }

    getStyles(): Observable<any> {
        return this.getMusicItem('style');
    }

    getBands(styleId?: string): Observable<any> {
        if (styleId) {
        return this.getMusicItem('band?styleId=' + styleId);
        }
        return this.getMusicItem('band');
    }
    getSongsForBand(bandId: string): Observable<any> {
        return this.getMusicItem('song?bandId=' + bandId);
    }
    getSongsForStyle(styleId: string): Observable<any> {
        return this.getMusicItem('song?styleId=' + styleId);
    }
    getAllSongs(): Observable<any> {
        return this.getMusicItem('song');
    }



    async getSongMidiById(id: string): Promise<any> {
        const self = this;
        // tslint:disable-next-line: only-arrow-functions
        return new Promise(function(resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', self.songLibraryUrl + 'song/midi/' + id, true);

            // Ask for the result as an ArrayBuffer.
            xhr.responseType = 'arraybuffer';

            xhr.onload = function(e) {
                resolve(this.response);
            };
            xhr.send();
        });
    }
    getSongById(id: string): Observable<any>  {
        return this.getMusicItem('song/' + id);
    }

    private   getMusicItem(path: string): Observable<any> {
        return this.http.get(this.songLibraryUrl + path);

    }
    private handleError(error: Response) {
        // in a real world app, we may send the server to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Observable.throw('Server error');
    }
}
