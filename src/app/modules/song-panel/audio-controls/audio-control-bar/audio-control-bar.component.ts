import { Component, Input, OnChanges, SimpleChange, HostListener, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { AudioControlsService } from '../services/audio-controls.service';
import { AudioControlsEventsService } from '../services/audio-controls-events.service';
import { AudioControlsEventTypes } from '../services/audio-controls-event-types.enum';
import { Midi2JsonService } from '../../../songs-library/services/midi-to-json.service';
import { SongJson } from '../../../../core/models/midi/song-json/song-json';
import { SliderComponent } from '../slider/slider.component';
import { AudioControlEvent } from '../services/audio-control-event';

declare var MIDIjs: any;

@Component({
    selector: 'audio-control-bar',
    templateUrl: './audio-control-bar.component.html',
    styleUrls: ['./audio-control-bar.component.scss']
})
export class AudioControlBarComponent implements OnChanges {
    @Input() song: SongJson;
    @ViewChild(SliderComponent,  {static: false})
    private audioControlBarSlider: SliderComponent;
    subscriptionAudioEvents: Subscription;
    mouseDown = false;
    sliderPositionAtStart = 0;
    sliderLastReportedPosition = 0;

    constructor(
        private midi2JsonService: Midi2JsonService,
        private audioControlsService: AudioControlsService,
        private audioControlsEventsService: AudioControlsEventsService) {
        this.subscriptionAudioEvents = this.audioControlsEventsService
            .getEvents().subscribe(event => {
                this.handleEvent(event);
            });
    }

    ngOnChanges() {
        this.audioControlsService.initialize(this.song);
    }

    private handleEvent(event: AudioControlEvent) {
        switch (event.type) {
            case AudioControlsEventTypes.play:
                this.handlePlayEvent();
                break;
            case AudioControlsEventTypes.stop:
                this.handleStopEvent();
                break;

            case AudioControlsEventTypes.musicProgress:
                this.musicProgress(event.data);
                break;
            case AudioControlsEventTypes.goToEnd:
                this.audioControlBarSlider.setValue(1);
                this.sliderLastReportedPosition = 1;
                break;
            case AudioControlsEventTypes.goToBeginning:
                this.audioControlBarSlider.setValue(0);
                this.sliderLastReportedPosition = 0;
                break;
        }
    }

    private handlePlayEvent() {
        this.sliderPositionAtStart = this.sliderLastReportedPosition;
        const eventData = this.sliderPositionAtStart;
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.playStartPositionCalculated, eventData);
    }

    private handleStopEvent() {
        this.audioControlBarSlider.setValue(0);
        this.sliderLastReportedPosition = 0;
    }

    private musicProgress(elapsedTimeInSeconds: number) {
        // the following check is needed because after clicking play, the first musicProgress event
        // arrives before than the play event.
        if (elapsedTimeInSeconds === 0) {
            return;
        }
        const durationFromStartingPosition = this.song.durationInSeconds * (1 - this.sliderPositionAtStart);
        if (durationFromStartingPosition === 0) {
            console.log('Unexpected song progress event because the total duration of the part of the song to play is 0');
            return;
        }
        if (elapsedTimeInSeconds >= this.song.durationInSeconds) {
            this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.endTimeReached);
        }
        const newSliderPosition = elapsedTimeInSeconds / durationFromStartingPosition + this.sliderPositionAtStart;
        this.audioControlBarSlider.setValue(newSliderPosition);
        this.sliderLastReportedPosition = newSliderPosition;
    }

    // value is a number between 0 and 1
    // this method is called when the user moves the slide
    public sliderMoved(value) {
        this.sliderLastReportedPosition = value;
        // if the song is currently playing, it will be restarted, so it starts from the new slide position
        this.audioControlsEventsService.raiseEvent(AudioControlsEventTypes.restart);
    }


}
