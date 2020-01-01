import { Component, Input, OnDestroy, OnChanges, SimpleChange } from '@angular/core';
import { Subscription } from 'rxjs';

import { Song } from '../../core/models/song';
import { SongJson } from '../../core/models/midi/song-json/song-json';
import { SongsRepositoryService } from '../../core/services/songs-repository.service';
import { Midi2JsonService } from '../songs-library/services/midi-to-json.service';
import { Band } from '../../core/models/band';
import { AudioControlsEventsService } from '../../modules/song-panel/audio-controls/services/audio-controls-events.service';
import { AudioControlEvent } from '../../modules/song-panel/audio-controls/services/audio-control-event';
import { AudioControlsEventTypes } from '../../modules/song-panel/audio-controls/services/audio-controls-event-types.enum';

declare var MIDIjs: any;

@Component({
    selector: "song-panel",
    templateUrl: './song-panel.component.html',
    styleUrls: ['./song-panel.component.scss']
})
export class SongPanelComponent implements OnChanges {
    song: Song;
    songJson: SongJson;
    @Input() selectedSongId: string;
    isCollapsed = false;
    subscriptionAudioEvents: Subscription;

    constructor(
        private songsService: SongsRepositoryService,
        private midi2JsonService: Midi2JsonService,
        private audioControlsEventsService: AudioControlsEventsService) {
        this.subscriptionAudioEvents = this.audioControlsEventsService
            .getEvents().subscribe(event => {
                this.handleEvent(event);
            });
    }
    private handleEvent(event: AudioControlEvent) {
        switch (event.type) {
            case AudioControlsEventTypes.collapseDisplay:
                this.isCollapsed = true;
                break;
            case AudioControlsEventTypes.expandDisplay:
                this.isCollapsed = false;
                break;
        }
    }


    async ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
        for (const propName in changes) {
            if (true) { // useless if added to avoid having lint complaining
                const changedProp = changes[propName];
                const from = JSON.stringify(changedProp.previousValue);
                const to = JSON.stringify(changedProp.currentValue);
                if (propName === 'selectedSongId' && to !== '') {
                    this.GetSongData();
                }
            }
        }
    }
    async GetSongData() {
        this.song = new Song();
        if (this.selectedSongId && this.selectedSongId !== '') {
            this.songsService.getSongById(this.selectedSongId).subscribe(
                data => {
                    this.song.name = data.name;
                    this.song._id = this.selectedSongId;
                    this.song.band = new Band();
                    this.song.band._id = data.band;
                    this.song.band.name = data.band.name;
                 }
            );
            this.song.midiFile = await (this.songsService.getSongMidiById(this.selectedSongId));
            this.songJson = this.midi2JsonService.getMidiObject(this.song.midiFile);
        }
    }
}

