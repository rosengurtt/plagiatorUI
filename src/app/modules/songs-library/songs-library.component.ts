import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Song } from '../../core/models/song';
import { SongsRepositoryService } from '../../core/services/songs-repository.service';
import { MusicStyle } from '../../core/models/music-style';
import { Band } from '../../core/models/band';
import { FileUploadService } from '../../core/services/file-upload.service';
import { SongSearchService } from '../../core/services/song-search.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-songs-library',
  templateUrl: './songs-library.component.html',
  styleUrls: ['./songs-library.component.scss']
})
export class SongsLibraryComponent implements OnInit {
  uploadUrl = 'http://localhost:9001/api/uploads';
  errorMessage: string;
  styles: MusicStyle[];
  bands: Band[];
  songs: Song[];
  selectedStyleId = '';
  selectedBandId = '';
  selectedSongId = '';
  selectedFileName = '';
  uploadedFile: File;
  uploadResult: string;
  listFilter: string;
  subscription: Subscription;

  constructor(
    private router: Router,
    private songService: SongsRepositoryService,
    private fileUploadService: FileUploadService,
    private songSearchService: SongSearchService) {
    this.subscription = songSearchService.searchTermAnnounce.subscribe(
      term => {
        this.listFilter = term;
      });
  }

  async ngOnInit(): Promise<any> {
    this.refreshDropDowns();
  }

  async selectStyle(styleId: string) {
    this.selectedStyleId = styleId;
    this.selectedBandId = '';
    this.refreshDropDowns();
  }
  async selectBand(bandId: string) {
    this.selectedBandId = bandId;
    this.refreshDropDowns();
  }
  async selectSong(songId: string) {
    this.router.navigate(['/song-panel/', songId])
    this.selectedSongId = songId;
  }

  refreshDropDowns(): any {
    this.songService.getStyles().subscribe(data => {
      this.styles = data.styles
    });
    this.songService.getBands(this.selectedStyleId)
      .subscribe(data => {
        this.bands = data.bands;
      });
    if (this.selectedBandId === '' && this.selectedStyleId === '') {
      this.songService.getAllSongs().subscribe(data => {
        this.songs = data.songs;
      });
    } else if (this.selectedBandId === '') {
      this.songService.getSongsForStyle(this.selectedStyleId).subscribe(data => {
        this.songs = data.songs;
      });
    } else {
      this.songService.getSongsForBand(this.selectedBandId).subscribe(data => {
        this.songs = data.songs;
      });
    }
  }
  fileChange(input: any) {
    this.selectedFileName = input.files[0].name;
    this.uploadedFile = input.files[0];
  }
  async UploadHandler(): Promise<any> {
    let result: any;
    if (!this.uploadedFile) {
      return;
    }
    try {
      result = await this.fileUploadService.upload(this.uploadUrl, this.uploadedFile);
    } catch (error) {
    }
    this.uploadResult = result.Result;
    this.selectedFileName = '';
  }

  OnDestroy() {
    // prevent memory leak when component destroyed
    this.subscription.unsubscribe();
  }

}


