import { Component, OnChanges, SimpleChange, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { Song } from '../../core/models/song';
import { SongJson } from '../../core/models/midi/song-json/song-json';
import { SongsRepositoryService } from '../../core/services/songs-repository.service';
import { Midi2JsonService } from '../../core/models/midi/song-json/midi-to-json.service';
import { Band } from '../../core/models/band';
import { AudioControlsEventsService } from '../../modules/song-panel/audio-controls/services/audio-controls-events.service';
import { AudioControlEvent } from '../../modules/song-panel/audio-controls/services/audio-control-event';
import { AudioControlsEventTypes } from '../../modules/song-panel/audio-controls/services/audio-controls-event-types.enum';
import { SongsLibraryEventsService } from '../songs-library/services/songs-library-events.service';
import { SongsLibraryEventTypes } from '../songs-library/services/songs-library-event-types.enum';


declare var MIDIjs: any;

@Component({
    selector: "song-panel",
    templateUrl: './song-panel.component.html',
    styleUrls: ['./song-panel.component.scss']
})
export class SongPanelComponent implements OnChanges, OnInit {
    song: Song;
    songJson: SongJson;
    selectedSongId: string;
    isCollapsed = false;
    subscriptionAudioEvents: Subscription;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private songsService: SongsRepositoryService,
        private midi2JsonService: Midi2JsonService,
        private songsLibraryEventsService: SongsLibraryEventsService,
        private audioControlsEventsService: AudioControlsEventsService) {
        this.subscriptionAudioEvents = this.audioControlsEventsService
            .getEvents().subscribe(event => {
                this.handleEvent(event);
            });
    }
    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(params => {
            this.selectedSongId = params.get('selectedSongId');
            this.GetSongData();
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
    closePanel(songId){
        this.songsLibraryEventsService.raiseEvent(SongsLibraryEventTypes.panelClosed, songId);
        this.router.navigate(['/songs-library']);
    }
}

