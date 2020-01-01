import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AudioControlsComponent } from './audio-controls.component';
import { AudioButtonsComponent } from './audio-buttons/audio-buttons.component';
import { AudioControlsService } from './services/audio-controls.service';
import { AudioControlBarComponent } from './audio-control-bar/audio-control-bar.component';
import { SliderComponent } from './slider/slider.component';

@NgModule({
    declarations: [
        AudioButtonsComponent,
        AudioControlsComponent,
        AudioControlBarComponent,
        SliderComponent
    ],
    imports: [
        FormsModule,
        CommonModule
    ],
    providers: [
        AudioControlsService
    ],
    exports: [
        AudioControlsComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AudioControlsModule { }
