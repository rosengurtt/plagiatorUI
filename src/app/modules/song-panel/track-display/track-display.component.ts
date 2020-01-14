import { Component, Input, AfterViewChecked, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { SongJson } from '../../../core/models/midi/song-json/song-json';
import { AudioControlsEventsService } from '../../song-panel/audio-controls/services/audio-controls-events.service';
import { AudioControlsEventTypes } from '../../song-panel/audio-controls/services/audio-controls-event-types.enum';
import { AudioControlEvent } from '../../song-panel/audio-controls/services/audio-control-event';
import { GeneralMidiInstrument } from '../,,/../../../core/models/midi/midi-codes/general-midi-instrument';
import { TrackDisplayService } from './services/track-display.service';
import { TrackType } from 'src/app/core/models/midi/song-json/track-type.enum';

declare var MIDIjs: any;

@Component({
    selector: 'track-display',
    templateUrl: './track-display.component.html',
    styleUrls: ['./track-display.component.scss']
})
export class TrackDisplayComponent implements AfterViewChecked, OnInit {
    @Input() song: SongJson;
    @Input() trackNotesNumber: number;
    trackNumber: number;
    subscriptionAudioEvents: Subscription;
    isInitialized = false;
    songIsPlaying: boolean;
    svgBoxId = 'svgBox' + this.trackNotesNumber;
    svgBox: any;  // html svg element where the music is shown graphically
    svgBoxWidth: number;
    progressBarId = 'progressBar' + this.trackNotesNumber;
    trackInfo: string;
    muteButtonCurrentImage = '/assets/images/speakerOn.png';
    imageSpeakerOn = '/assets/images/speakerOn.png';
    imageSpeakerOff = '/assets/images/speakerOff.png';
    trackIsMuted: boolean;
    trackIsSolo: boolean;
    soloUnsolo: string; // text that shows if track is playing solo or not
    initialVolume: number;
    trackType: string;
    averagePitch: number;

    constructor(
        private trackDisplayService: TrackDisplayService,
        private audioControlsEventsService: AudioControlsEventsService) {
        this.subscriptionAudioEvents = this.audioControlsEventsService
            .getEvents().subscribe(event => {
                this.handleEvent(event);
            });
    }

    private handleEvent(event: AudioControlEvent) {
        switch (event.type) {
            case AudioControlsEventTypes.trackSolo:
                if (event.data !== this.trackNumber) {
                    this.muteButtonCurrentImage = this.imageSpeakerOff;
                    this.trackIsMuted = true;
                    this.soloUnsolo = 'Solo';
                }
                break;
            case AudioControlsEventTypes.trackUnsolo:
                if (event.data !== this.trackNumber) {
                    this.resetTrack();
                }
                break;
            case AudioControlsEventTypes.reset:
                this.resetTrack();
                break;
        }
    }

    ngOnInit() {
        // Populate information section
        this.trackNumber = this.song.notesTracks[this.trackNotesNumber].trackNumber;
        // let thisTrackInfo = this.song.notesTracks[this.trackNotesNumber];
        const track = this.song.tracks[this.trackNumber];

        if (track.channel !== 9) {
            this.trackInfo = GeneralMidiInstrument.GetInstrumentName(track.Instrument);
        } else {
            this.trackInfo = 'Drums';
        }
        this.trackInfo += ' - Channel ' + (track.channel + 1);

        if (this.song.notesTracks.length > 1) {
            this.soloUnsolo = 'Solo';
        } else {
            this.soloUnsolo = '';
        }
        this.initialVolume = track.Volume;
        this.trackType = TrackType[track.TrackType];
        this.averagePitch = track.AveragePitch;
    }

    ngAfterViewChecked() {
        if (!this.isInitialized) {
            this.initialize();
            this.trackDisplayService.initialize(this.song);
            //  this.trackDisplayService.drawTrackGraphic(this.trackNotesNumber);
            this.isInitialized = true;
        }
    }
    private initialize() {
        this.trackIsMuted = false;
        this.trackIsSolo = false;
        this.muteButtonCurrentImage = this.imageSpeakerOn;
    }


    public toggleMute() {
        this.trackIsMuted = !this.trackIsMuted;
        if (this.trackIsMuted) {
            this.muteButtonCurrentImage = this.imageSpeakerOff;
            this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.trackMuted, this.trackNumber);
        } else {
            this.muteButtonCurrentImage = this.imageSpeakerOn;
            this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.trackUnmuted, this.trackNumber);
        }
    }

    public toggleSolo() {
        this.trackIsSolo = !this.trackIsSolo;
        if (this.trackIsSolo) {
            this.soloUnsolo = 'Unsolo';
            this.muteButtonCurrentImage = this.imageSpeakerOn;
            this.trackIsMuted = false;
            this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.trackSolo, this.trackNumber);
        } else {
            this.soloUnsolo = 'Solo';
            this.muteButtonCurrentImage = this.imageSpeakerOn;
            this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.trackUnsolo, this.trackNumber);
        }
    }

    public volumeChange(vol) {
        const eventData: any = { trackNumber: this.trackNumber, volume: vol };
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.volumeChange, eventData);
    }
    public resetTrack() {
        this.muteButtonCurrentImage = this.imageSpeakerOn;
        this.trackIsMuted = false;
        this.soloUnsolo = 'Solo';
    }
}