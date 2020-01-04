import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SongSearchService } from '../services/song-search.service';
import { Song } from '../models/song';
import { Band } from '../models/band';
import { SongsLibraryEventsService } from 'src/app/modules/songs-library/services/songs-library-events.service';
import { SongsLibraryEventTypes } from 'src/app/modules/songs-library/services/songs-library-event-types.enum';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  term = new FormControl();
  sub: Subscription;
  songs: Song[] = [];
  subscriptionSongsLibraryEvents: Subscription;

  constructor(
    private songSearchService: SongSearchService,
    private songsLibraryEventsService: SongsLibraryEventsService) {
    this.subscriptionSongsLibraryEvents = this.songsLibraryEventsService
      .getEvents().subscribe(event => {
        switch (event.type) {
          case SongsLibraryEventTypes.songSelected:
            localStorage.setItem('songString' + this.songs.length, event.data.songName);
            this.songs.push(event.data);
        }
      });
  }

  ngOnInit() {
    this.sub = this.term.valueChanges
      .subscribe(
        value => {
          this.songSearchService.announceSearchTerm(value);
        },
        error => console.log(error)
      );
  }



  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
  }

}
