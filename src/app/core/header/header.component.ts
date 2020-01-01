import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SongSearchService } from '../services/song-search.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  term = new FormControl();
  sub: Subscription;

  constructor(private songSearchService: SongSearchService) { }

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
