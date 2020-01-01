import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './core/header/header.component';
import { HomeComponent } from './modules/home/home.component';
import { SongSearchService } from './core/services/song-search.service';
import { SongsLibraryModule } from './modules/songs-library/songs-library.module';
import { SongPanelModule } from './modules/song-panel/song-panel.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
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
