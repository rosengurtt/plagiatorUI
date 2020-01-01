import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { Midi2JsonService } from '../../../songs-library/services/midi-to-json.service';
import { SongJson } from '../../../../core/models/midi/song-json/song-json';
import { Uint8Array2ArrayBuffer } from '../../../../core/helpers/uint8array-to-arraybuffer';
import { AudioControlEvent } from '../../audio-controls/services/audio-control-event';
import { AudioControlsEventTypes } from '../../audio-controls/services/audio-controls-event-types.enum';
import { AudioControlsEventsService } from '../../audio-controls/services/audio-controls-events.service';

declare var MIDIjs: any;

@Injectable()
export class AudioControlsService {

    isPlaying = false;
    isRestarting = false;
    subscriptionAudioEvents: Subscription;
    song: SongJson;
    sliderPositionAtStart = 0;
    mutedTracks: number[];
    volumeTracks: number[]; // initially is the volume read from the file, but the user can change it
    songPartToPlay: ArrayBuffer;
    tempo: number;



    constructor(
        private midi2jsonService: Midi2JsonService,
        private audioControlsEventsService: AudioControlsEventsService) {
        this.subscriptionAudioEvents = this.audioControlsEventsService
            .getEvents().subscribe(event => {
                this.handleEvent(event);
            });
    }

    private handleEvent(event: AudioControlEvent) {
        switch (event.type) {
            case AudioControlsEventTypes.playStartPositionCalculated:
                this.isPlaying = true;
                this.sliderPositionAtStart = event.data;
                this.songPartToPlay = this.getSongBytesFromStartingPosition();
                MIDIjs.play(this.songPartToPlay);
                break;

            case AudioControlsEventTypes.pause:
                this.isPlaying = false;
                MIDIjs.stop();
                break;

            case AudioControlsEventTypes.stop:
                this.isPlaying = false;
                MIDIjs.stop();
                break;
            case AudioControlsEventTypes.trackMuted:
                // check if the track is already in the list of muted tracks
                if (this.mutedTracks.indexOf(event.data) === -1) {
                    // it is not in the list, then add it
                    this.mutedTracks.push(event.data);
                }
                this.restartSong();
                break;
            case AudioControlsEventTypes.trackUnmuted:
                const index = this.mutedTracks.indexOf(event.data)
                if (index !== -1) {
                    this.mutedTracks.splice(index, 1);
                }
                this.restartSong();
                break;
            case AudioControlsEventTypes.trackSolo:
                this.mutedTracks = [];
                for (const notesTrack of this.song.notesTracks) {
                    if (notesTrack.trackNumber !== event.data) {
                        this.mutedTracks.push(notesTrack.trackNumber);
                    }
                }
                this.restartSong();
                break;
            case AudioControlsEventTypes.trackUnsolo:
                this.mutedTracks = [];
                this.restartSong();
                break;
            case AudioControlsEventTypes.volumeChange:
                const trackNumber = event.data.trackNumber;
                const volume = event.data.volume;
                this.volumeTracks[trackNumber] = volume;
                this.restartSong();
                break;
            case AudioControlsEventTypes.tempoChange:
                const newTempo = event.data;
                this.tempo = newTempo;
                this.restartSong();
                break;
            case AudioControlsEventTypes.restart:
                this.restartSong();
                break;
            case AudioControlsEventTypes.reset:
                this.initialize(this.song);
                this.restartSong();
                break;
        }
    }

    public initialize(songData: SongJson) {
        this.song = songData;
        this.tempo = this.song.tempoEvents[0].tempoBPM;
        this.mutedTracks = [];
        this.volumeTracks = [];
        for (const track of this.song.tracks){
            this.volumeTracks.push(track.Volume);
        }
    }

    public getSongBytesFromStartingPosition(): ArrayBuffer {
        const positionControlLocationCurrentInTicks = this.song.durationInTicks * this.sliderPositionAtStart;
        const sliceFromCurrentPosition =
            this.song.getSliceStartingFromTick(positionControlLocationCurrentInTicks, this.mutedTracks, this.volumeTracks, this.tempo);
        const midiBytes = this.midi2jsonService.getMidiBytes(sliceFromCurrentPosition);
        return Uint8Array2ArrayBuffer.convert(midiBytes);
    }

    private restartSong() {
        if (!this.isPlaying || this.isRestarting) {
            return;
        }
        this.isRestarting = true;
        const self = this;
        setTimeout(() =>  {
            self.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.pause);
        }, 10);
        setTimeout(() => {
            self.isRestarting = false;
            self.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.play);
        }, 1500);
    }
}

