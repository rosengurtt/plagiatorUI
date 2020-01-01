import { Component, Input, AfterViewChecked } from '@angular/core';
import { Subscription } from 'rxjs';

import { SongJson } from '../../../core/models/midi/song-json/song-json';
import { TrackDisplayService } from '../track-display/services/track-display.service';

declare var MIDIjs: any;

@Component({
    selector: 'tracks-collapsed',
    templateUrl: './tracks-collapsed.component.html',
    styles: ['.draggable {cursor: move; }']
})
export class TracksCollapsedComponent implements AfterViewChecked {
    @Input() song: SongJson;
    subscriptionAudioEvents: Subscription;
    isInitialized = false;
    songIsPlaying: boolean;
    svgBoxId = 'svgBoxCollapsed';
    svgBox: any;  // html svg element where the music is shown graphically
    svgBoxWidth: number;
    progressBarId = 'progressBar';
    trackInfo: string;
    muteButtonCurrentImage = 'app/assets/images/speakerOn.png';

    constructor(
        private trackDisplayService: TrackDisplayService) {
    }



    ngAfterViewChecked() {
        if (!this.isInitialized) {
            this.trackDisplayService.initialize(this.song);
            this.trackDisplayService.drawTracksCollapsedGraphic();
            this.isInitialized = true;
            for (const track of this.song.notesTracks) {
               // this.trackInfo += GeneralMidiInstrument.GetInstrumentName(track.instrument) + ',';
            }
        }
    }
}
