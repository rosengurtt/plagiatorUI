import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SongSearchService } from '../services/song-search.service';
import { Song } from '../models/song';
import { Band } from '../models/band';
import { SongsLibraryEventsService } from 'src/app/modules/songs-library/services/songs-library-events.service';
import { SongsLibraryEventTypes } from 'src/app/modules/songs-library/services/songs-library-event-types.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  term = new FormControl();
  sub: Subscription;
  songs: any[] = [];
  subscriptionSongsLibraryEvents: Subscription;

  constructor(
    private router: Router,
    private songSearchService: SongSearchService,
    private songsLibraryEventsService: SongsLibraryEventsService) {
    this.songs = this.getSongsFromLocalStorage();
    this.subscriptionSongsLibraryEvents = this.songsLibraryEventsService
      .getEvents().subscribe(event => {
        switch (event.type) {
          case SongsLibraryEventTypes.songSelected:
            if (!this.isSongAlreadyOpen(event.data)) {
              this.songs.push(event.data);
              this.saveSongsToLocalStorage();
            }
            break;
          case SongsLibraryEventTypes.panelClosed:
            this.songs = this.songs.filter(item => item._id !== event.data);
            this.saveSongsToLocalStorage();
        }
      });
  }

  isSongAlreadyOpen(song: any): boolean {
    for (let s of this.songs) {
      if (s._id === song._id) {
        return true;
      }
    }
    return false;
  }
  getSongsFromLocalStorage(): any {
    const retVal = [];
    if (localStorage.getItem('songNames') != null) {
      const songNames = localStorage.getItem('songNames').split(',');
      const bandNames = localStorage.getItem('bandNames').split(',');
      const songIds = localStorage.getItem('songIds').split(',');
      this.songs = [];
      for (let i = 0; i < songNames.length; i++) {
        const songData = { _id: songIds[i], songName: songNames[i], bandName: bandNames[i] };
        retVal.push(songData);
      }
    }
    return retVal;
  }
  saveSongsToLocalStorage() {
    let songNames = '';
    let bandNames = '';
    let songIds = '';
    for (let i = 0; i < this.songs.length; i++) {
      if (i === this.songs.length - 1) {
        songNames += this.songs[i].songName;
        bandNames += this.songs[i].bandName;
        songIds += this.songs[i]._id;
      } else {
        songNames += this.songs[i].songName + ',';
        bandNames += this.songs[i].bandName + ',';
        songIds += this.songs[i]._id + ',';
      }
    }
    localStorage.setItem('songNames', songNames);
    localStorage.setItem('bandNames', bandNames);
    localStorage.setItem('songIds', songIds);
  }

  ngOnInit() {
    this.sub = this.term.valueChanges
      .subscribe(
        value => {
          this.songSearchService.announceSearchTerm(value);
          if (this.router.url !== '/songs-library') {
            this.router.navigate(['/songs-library']);
          }
        },
        error => console.log(error)
      );
  }



  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
  }

}
