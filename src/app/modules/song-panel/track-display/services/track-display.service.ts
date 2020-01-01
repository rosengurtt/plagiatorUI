import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

import { SongJson } from '../../../../core/models/midi/song-json/song-json';
import { AudioControlsEventsService } from '../../../song-panel/audio-controls/services/audio-controls-events.service';
import { AudioControlEvent } from '../../../song-panel/audio-controls/services/audio-control-event';
import { AudioControlsEventTypes } from '../../../song-panel/audio-controls/services/audio-controls-event-types.enum';
import { SvgBoxService } from '../../song-display/services/svg-box.service';


@Injectable()
export class TrackDisplayService {
    song: SongJson;
    subscriptionAudioEvents: Subscription;
    songIsPlaying: boolean;
    zoomxIndex: number;  // is the index inside the zoomSteps array
    zoomSteps: number[] = [1, 1.5, 2, 3, 4, 6, 8, 12, 16, 20, 30, 45, 60];
    scrollDisplacementX: number; // when the user has zoomed in, and only part of the image is
    // shown, scrollDisplacement is the length from the left border
    // to the beginning of the song (outside the image)
    scrollDisplacementY: number;
    svgBoxIdPrefix = 'svgBox';
    progressBarIdPrefix = 'progressBar';
    svgBoxCollapsedId = 'svgBoxCollapsed';
    progressBarCollapsedId = 'progressBar';
    moveStep = 0.7;    // How much the image move when clicking the arrow buttons. 70%
    sliderPositionAtStart = 0;

    constructor(
        private audioControlsEventsService: AudioControlsEventsService,
        private svgBoxService: SvgBoxService) {
        this.subscriptionAudioEvents = this.audioControlsEventsService
            .getEvents().subscribe(event => {
                this.handleEvent(event);
            });
    }

    public initialize(song: SongJson) {
        if (this.allSvgBoxesHaveBeenCreated(song.notesTracks.length)) {
            this.song = song;
            this.zoomxIndex = 0;
            this.scrollDisplacementX = 0;
            this.scrollDisplacementY = 0;
            this.songIsPlaying = false;
            this.updateGraphics();
        }
    }

    private allSvgBoxesHaveBeenCreated(noTracks: number): boolean {
        const svgBoxCollapsed = document.getElementById(this.svgBoxCollapsedId);
        const lastSvgBoxTrack = document.getElementById(this.svgBoxIdPrefix + (noTracks - 1));
        if (svgBoxCollapsed || lastSvgBoxTrack) {
            return true;
        }
        return false;
    }

    private handleEvent(event: AudioControlEvent) {
        switch (event.type) {
            case AudioControlsEventTypes.playStartPositionCalculated:
                this.sliderPositionAtStart = event.data;
                break;
        }
    }

    private zoomX() {
        return this.zoomSteps[this.zoomxIndex];
    }
    // ------------------------------------------------------------------------------
    // Responses to events
    // ------------------------------------------------------------------------------
    // stepSign is +1 for zoom in and -1 for zoom out
    public changeZoomX(stepSign: number) {
        // if invalid parameter do nothing
        if (stepSign !== 1 && stepSign !== -1) {
            return;
        }
        this.zoomxIndex += stepSign;
        if (this.zoomxIndex < 0) {
            this.zoomxIndex = 0;
        } else if (this.zoomxIndex >= this.zoomSteps.length) {
            this.zoomxIndex = this.zoomSteps.length - 1;
        }
        this.scrollDisplacementX *= (this.zoomX() - 1);
        this.scrollDisplacementX = 0;
        this.updateGraphics();
    }
    public moveWindow(directionX: number, directionY: number) {
        // when we haven't zoomed in, there is no need to move anything
        if (this.zoomX() <= 1) {
            return;
        }
        // Get the first one, just to take the size
        const svgBoxId = this.svgBoxIdPrefix + '0';
        let svgBox = document.getElementById(svgBoxId);
        if (!svgBox) {
            svgBox = document.getElementById(this.svgBoxCollapsedId);
            if (!svgBox) {
                return;
            }
        }
        const svgBoxWidth = svgBox.clientWidth;
        const svgBoxHeight = svgBox.clientHeight;
        const initialScrollDisplacementX = this.scrollDisplacementX;
        const initialScrollDisplacementY = this.scrollDisplacementY;
        if (directionX !== 0) {
            const fullWidth: number = this.zoomX() * svgBoxWidth;
            const distanceToMove = svgBoxWidth * this.moveStep * directionX;
            if (this.scrollDisplacementX + distanceToMove < 0) {
                this.scrollDisplacementX = 0;
            } else if (this.scrollDisplacementX + distanceToMove + svgBoxWidth > fullWidth) {
                this.scrollDisplacementX = fullWidth - svgBoxWidth;
            } else {
                this.scrollDisplacementX += distanceToMove;
            }
        }
        if (directionY !== 0) {
            const fullHeight: number = this.zoomX() * svgBoxHeight;
            const distanceToMove = svgBoxHeight * this.moveStep * directionY;
            if (this.scrollDisplacementY + distanceToMove < 0) {
                this.scrollDisplacementY = 0;
            } else if (this.scrollDisplacementY + distanceToMove + svgBoxHeight > fullHeight) {
                this.scrollDisplacementY = fullHeight - svgBoxHeight;
            } else {
                this.scrollDisplacementY += distanceToMove;
            }
        }
        if (initialScrollDisplacementX !== this.scrollDisplacementX ||
            initialScrollDisplacementY !== this.scrollDisplacementY) {
            this.updateGraphics();
        }
    }
    public updateGraphics() {
        for (let i = 0; i < this.song.notesTracks.length; i++) {
            this.drawTrackGraphic(i);
        }
        this.drawTracksCollapsedGraphic();
    }
    public drawTrackGraphic(trackNumber: number) {
        const svgBoxId = this.svgBoxIdPrefix + trackNumber;
        const progressBarId = this.progressBarIdPrefix + trackNumber;
        this.svgBoxService.drawTrackGraphic(trackNumber, svgBoxId, this.song, this.zoomX(),
            this.scrollDisplacementX, this.scrollDisplacementY, this.songIsPlaying, progressBarId);
    }
    public drawTracksCollapsedGraphic() {
        this.svgBoxService.drawTracksCollapsedGraphic(this.svgBoxCollapsedId, this.song, this.zoomX(),
            this.scrollDisplacementX, this.scrollDisplacementY, this.songIsPlaying, this.progressBarCollapsedId);
    }

    public createProgressBar(progress: number) {
        for (let i = 0; i < this.song.notesTracks.length; i++) {
            const progressBarId = this.progressBarIdPrefix + i;
            const svgBoxId = this.svgBoxIdPrefix + i;
            this.svgBoxService.createProgressBar(svgBoxId, progressBarId, this.zoomX(),
                this.scrollDisplacementX, progress);
        }
        this.svgBoxService.createProgressBar(this.svgBoxCollapsedId, this.progressBarCollapsedId,
            this.zoomX(), this.scrollDisplacementX, progress);
    }
    public songStarted(startPositionInTicks: number) {
        this.songIsPlaying = true;
        this.createProgressBar(0);
    }
    public songPausedOrStopped() {
        this.songIsPlaying = false;
        this.updateGraphics();
    }



    public updateProgress(elapsedTimeInSeconds: number) {
        const totalDuration = this.song.durationInSeconds * (1 - this.sliderPositionAtStart);
        if (totalDuration === 0) { // check to avoid a division by 0
            console.log('Unexpected song progress event because the total duration of the part of the song to play is 0');
            return;
        }
        const progress = elapsedTimeInSeconds / totalDuration + this.sliderPositionAtStart;
        if (elapsedTimeInSeconds > 0) {
            this.createProgressBar(progress);
        }
    }
}
