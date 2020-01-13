import { Component, Input, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';

import { SongJson } from '../../../../core/models/midi/song-json/song-json';
import { AudioControlsEventsService } from '../services/audio-controls-events.service';
import { AudioControlsService } from '../services/audio-controls.service';
import { AudioControlsEventTypes } from '../services/audio-controls-event-types.enum';
import { AudioControlEvent } from '../services/audio-control-event';
import { MidiFileCheckerService } from '../../../../core/models/midi//midi-file-checker.service';

declare var MIDIjs: any;

@Component({
    selector: 'audio-buttons',
    templateUrl: './audio-buttons.component.html',
    styleUrls: ['./audio-buttons.component.scss']
})
export class AudioButtonsComponent implements OnChanges {
    @Input() song: SongJson;
    @Input() selectedSongId: string;
    subscriptionAudioEvents: Subscription;
    mouseDown = false;
    loadFinished: boolean;
    bpm: string;
    collapsed = false;

    constructor(
        private audioControlsService: AudioControlsService,
        private midiFileCheckerService: MidiFileCheckerService,
        private audioControlsEventsService: AudioControlsEventsService) {
        this.subscriptionAudioEvents = this.audioControlsEventsService
            .getEvents().subscribe(event => {
                this.handleEvent(event);
            });
    }

    ngOnChanges() {
        this.resetTempo();
    }
    resetTempo() {
        let tempo = this.song.tempoEvents[0].tempoBPM;
        tempo = tempo ? tempo : 120;
        this.bpm = tempo.toFixed(0);
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.tempoChange, this.bpm);

    }
    tempoChange(newValue) {
        this.bpm = newValue;
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.tempoChange, this.bpm);
    }

    private handleEvent(event: AudioControlEvent) {
        switch (event.type) {
            case AudioControlsEventTypes.musicStarted:
                // this.downloadeame("bachInven8.txt", JSON.stringify(this.song.notesTracks));
                // this.downloadeame("midifile.txt", this.audioControlsService.songPartToPlay);
                // let check = this.midiFileCheckerService.check(new Uint8Array(this.audioControlsService.songPartToPlay));
                break;
        }
    }

    playSong() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.play);
    }
    playOriginalMidi() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.playOriginalMidi);
    }

    pauseSong() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.pause);
    }
    stopSong() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.stop);
    }

    goToBeginning() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.goToBeginning);
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.restart);
    }
    goToEnd() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.goToEnd);
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.restart);
    }
    zoomxIn() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.zoomxIn);
    }

    zoomxOut() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.zoomxOut);
    }
    moveLeft() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.moveLeft);
    }
    moveRight() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.moveRight);
    }
    moveUp() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.moveUp);
    }
    moveDown() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.moveDown);
    }

    collapseExpand() {
        this.collapsed = !this.collapsed;
        if (this.collapsed) {
            this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.collapseDisplay);
        } else {
            this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.expandDisplay);
        }
    }
    get_collapsed_expand_icon(): any {
        if (!this.collapsed) {
            return  'unfold_less';
        }
        return 'unfold_more';
    }

    reset() {
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.reset);
        window.location.reload();
    }
    //  used for debugging. Allows to save buffer to disk
    // private downloadeame(filename, buffer) {
    //     let base64encoded = Binary2base64.convert(buffer);
    //     let element = document.createElement('a');
    //     element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(base64encoded));
    //     element.setAttribute('download', filename);

    //     element.style.display = 'none';
    //     document.body.appendChild(element);

    //     element.click();

    //     document.body.removeChild(element);
    // }
    private downloadeame(filename, text) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

}

