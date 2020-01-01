import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SongDisplayComponent } from './song-display.component';
import { TrackDisplayComponent } from '../track-display/track-display.component';
import { TracksCollapsedComponent } from '../tracks-collapsed/tracks-collapsed.component';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
    imports: [
        BrowserModule
    ],
    declarations: [
        SongDisplayComponent,
        TrackDisplayComponent,
        TracksCollapsedComponent
    ],
    providers: [
    ],
    exports: [
        SongDisplayComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SongDisplayModule { }
