import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SongDisplayComponent } from './song-display/song-display.component';
import { TrackDisplayComponent } from './track-display/track-display.component';
import { TracksCollapsedComponent } from './tracks-collapsed/tracks-collapsed.component';
import { FileUploadService } from 'src/app/core/services/file-upload.service';
import { Midi2JsonService } from '../songs-library/services/midi-to-json.service';
import { MidiFileCheckerService } from '../songs-library/services/midi-file-checker.service';
import { TrackDisplayService } from './track-display/services/track-display.service';
import { SvgBoxService } from './song-display/services/svg-box.service';
import { SongsRepositoryService } from '../../core/services/songs-repository.service';
import { AudioControlsComponent } from './audio-controls/audio-controls.component';
import { CommonModule } from '@angular/common';
import { AudioControlsModule } from './audio-controls/audio-controls.module';
import { SongDisplayModule } from './song-display/song-display.module';
import { SongPanelComponent } from './song-panel.component';
import { AudioControlsEventsService } from './audio-controls/services/audio-controls-events.service';

@NgModule({
    declarations: [
        SongPanelComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        SongDisplayModule,
        AudioControlsModule
    ],
    providers: [
        SongsRepositoryService,
        FileUploadService,
        Midi2JsonService,
        MidiFileCheckerService,
        TrackDisplayService,
        SvgBoxService,
        AudioControlsEventsService
    ],
    exports: [
        SongPanelComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SongPanelModule { }
