import { Component, Input } from '@angular/core';

import { SongJson } from '../../../core/models/midi/song-json/song-json';
import { AudioControlsEventsService } from './services/audio-controls-events.service';
import { AudioControlsEventTypes } from './services/audio-controls-event-types.enum';

declare var MIDIjs: any;

@Component({
    selector: 'audio-controls',
    templateUrl: './audio-controls.component.html',
    styleUrls: ['./audio-controls.component.scss']
})
export class AudioControlsComponent {
    @Input() song: SongJson;

    constructor(
        private audioControlsEventsService: AudioControlsEventsService) {
    }
    // The following events are raised by the midijs library

    MidiSoundStarted() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.musicStarted);
    }
    MidiSoundFinished() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.musicStopped);
    }
    MidiSoundProgress(event: any) {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.musicProgress, event.time);
    }
}
