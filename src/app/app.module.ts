import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './core/header/header.component';
import { HomeComponent } from './modules/home/home.component';
import { SongsLibraryComponent } from './modules/songs-library/songs-library.component';
import { FileUploadService } from './core/services/file-upload.service';
import { SongSearchService } from './core/services/song-search.service';
import { SongsLibraryModule } from './modules/songs-library/songs-library.module';
import { SongPanelComponent } from './modules/song-panel/song-panel.component';
import { SongDisplayComponent } from './modules/song-panel/song-display/song-display.component';
import { AudioControlsComponent } from './modules/song-panel/audio-controls/audio-controls.component';
import { TrackDisplayComponent } from './modules/song-panel/track-display/track-display.component';
import { SongPanelModule } from './modules/song-panel/song-panel.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    SongsLibraryModule,
    SongPanelModule
  ],
  providers: [
    SongSearchService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
