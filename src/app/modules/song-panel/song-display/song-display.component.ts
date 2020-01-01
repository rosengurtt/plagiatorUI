import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { SongJson } from '../../../core/models/midi/song-json/song-json';
import { AudioControlsEventsService } from '../../song-panel/audio-controls/services/audio-controls-events.service';
import { AudioControlsEventTypes } from '../../song-panel/audio-controls/services/audio-controls-event-types.enum';
import { AudioControlEvent } from '../../song-panel/audio-controls/services/audio-control-event';
import { TrackDisplayService } from '../../song-panel/track-display/services/track-display.service';


declare var MIDIjs: any;

@Component({
    selector: 'song-display',
    templateUrl: './song-display.component.html',
    styleUrls: ['./song-display.component.scss']
})
export class SongDisplayComponent implements OnChanges, OnInit {
    @Input() song: SongJson;
    @Input() isCollapsed: boolean;
    subscriptionAudioEvents: Subscription;
    isInitialized = false;

    constructor(
        private trackDisplayService: TrackDisplayService,
        private audioControlsEventsService: AudioControlsEventsService) {
        this.subscriptionAudioEvents = this.audioControlsEventsService
            .getEvents().subscribe(event => {
                this.handleEvent(event);
            });
    }


    ngOnChanges() {
        if (this.isInitialized) {
            this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.stop);
        }
    }
    ngOnInit() {
        this.isInitialized = true;
    }
    private handleEvent(event: AudioControlEvent) {
        switch (event.type) {
            case AudioControlsEventTypes.play:
                this.trackDisplayService.songStarted(event.data);
                break;
            case AudioControlsEventTypes.stop:
                this.trackDisplayService.songPausedOrStopped();
                break;
            case AudioControlsEventTypes.pause:
                this.trackDisplayService.songPausedOrStopped();
                break;
            case AudioControlsEventTypes.zoomxIn:
                this.trackDisplayService.changeZoomX(1);
                break;
            case AudioControlsEventTypes.zoomxOut:
                this.trackDisplayService.changeZoomX(-1);
                break;
            case AudioControlsEventTypes.moveUp:
                this.trackDisplayService.moveWindow(0, -1);
                break;
            case AudioControlsEventTypes.moveDown:
                this.trackDisplayService.moveWindow(0, 1);
                break;
            case AudioControlsEventTypes.moveLeft:
                this.trackDisplayService.moveWindow(-1, 0);
                break;
            case AudioControlsEventTypes.moveRight:
                this.trackDisplayService.moveWindow(1, 0);
                break;
            case AudioControlsEventTypes.musicProgress:
                this.trackDisplayService.updateProgress(event.data);

        }
    }
}

