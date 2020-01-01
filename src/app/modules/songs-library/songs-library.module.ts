import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { SongsLibraryComponent } from './songs-library.component';
// import { SongDetailsComponent } from './song-details.component';

import { SongsRepositoryService } from '../../core/services/songs-repository.service';
// import { Midi2JsonService } from '../midi/midi-to-json.service';
// import { MidiFileCheckerService } from '../midi/midi-file-checker.service';

import { SongFilterPipe } from './pipes/song-filter.pipe';

// import { SharedModule } from '../shared/shared.module';
// import { AudioControlsModule } from '../audio-controls/audio-controls.module';
// import { SongDisplayModule } from '../song-display/song-display.module';
import { FileUploadService } from '../../core/services/file-upload.service';
import { SortPipe } from '../../core/pipes/sort-by.pipe';
import { SongPanelModule } from '../song-panel/song-panel.module';
// import { TrackDisplayService } from '../song-display/track-display.service';
// import { SvgBoxService } from '../song-display/svg-box.service';

@NgModule({
  declarations: [
    SongsLibraryComponent,
    SongFilterPipe,
    SortPipe
  ],
  imports: [
    BrowserModule,
    SongPanelModule,
    RouterModule.forChild([
      { path: 'songs-library', component: SongsLibraryComponent },
    ])
  ],
  providers: [
    SongsRepositoryService,
    FileUploadService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SongsLibraryModule { }
