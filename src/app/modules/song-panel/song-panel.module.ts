import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SongDisplayComponent } from './song-display/song-display.component';
import { TrackDisplayComponent } from './track-display/track-display.component';
import { TracksCollapsedComponent } from './tracks-collapsed/tracks-collapsed.component';
import { FileUploadService } from '../../core/services/file-upload.service';
import { Midi2JsonService } from '../../core//models/midi/song-json/midi-to-json.service';
import { MidiFileCheckerService } from '../../core//models/midi/midi-file-checker.service';
import { TrackDisplayService } from './track-display/services/track-display.service';
import { SvgBoxService } from './song-display/services/svg-box.service';
import { SongsRepositoryService } from '../../core/services/songs-repository.service';
import { AudioControlsComponent } from './audio-controls/audio-controls.component';
import { CommonModule } from '@angular/common';
import { SongPanelComponent } from './song-panel.component';
import { AudioControlsEventsService } from './audio-controls/services/audio-controls-events.service';
import { SliderComponent } from './slider/slider.component';
import { AudioButtonsComponent } from './audio-controls/audio-buttons/audio-buttons.component';
import { AudioControlBarComponent } from './audio-controls/audio-control-bar/audio-control-bar.component';
import { AudioControlsService } from './audio-controls/services/audio-controls.service';
import { RouterModule } from '@angular/router';


@NgModule({
    declarations: [
        SongPanelComponent,
        SliderComponent,
        AudioControlsComponent,
        AudioButtonsComponent,
        AudioControlBarComponent,
        SongDisplayComponent,
        TrackDisplayComponent,
        TracksCollapsedComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        RouterModule
    ],
    providers: [
        SongsRepositoryService,
        FileUploadService,
        Midi2JsonService,
        MidiFileCheckerService,
        TrackDisplayService,
        SvgBoxService,
        AudioControlsEventsService,
        AudioControlsService,
        TrackDisplayService
    ],
    exports: [
        SongPanelComponent,
        SliderComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SongPanelModule { }
