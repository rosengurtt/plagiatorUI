import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { SongsLibraryEventTypes } from './songs-library-event-types.enum';
import { SongsLibraryEvent } from './songs-library-event';
import { Song } from 'src/app/core/models/song';


@Injectable()
export class SongsLibraryEventsService {
    private subject = new Subject<SongsLibraryEvent>();

    raiseEvent(eventType: SongsLibraryEventTypes, eventData?: any) {
        this.subject.next(new SongsLibraryEvent(eventType, eventData));
    }

    clearEvents() {
        this.subject.next();
    }

    getEvents(): Observable<SongsLibraryEvent> {
        return this.subject.asObservable();
    }
}
