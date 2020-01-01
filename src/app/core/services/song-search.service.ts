import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class SongSearchService {
    // Observable string sources
    private searchTermSource = new Subject<string>();
    // Observable string streams
    searchTermAnnounce: Observable<string> = this.searchTermSource.asObservable();

    // Service message commands
    announceSearchTerm(term: string) {
        this.searchTermSource.next(term);
    }
}