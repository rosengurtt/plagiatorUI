import { SongsLibraryEventTypes } from './songs-library-event-types.enum';
import { Song } from 'src/app/core/models/song';

export class SongsLibraryEvent {
    constructor(public type: SongsLibraryEventTypes, public data: any) {
    }
}