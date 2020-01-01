import { SongTonality } from './song-tonality';
import { ScaleMode } from './scale-mode.enum';
import { NotesTrack } from '../../midi/notes-track';
import * as data1 from './test-data/c-scale-song.json';
import * as data2 from './test-data/f-minor-song.json';
import * as data3 from './test-data/year-cat.json';
import * as data4 from './test-data/bach-inven-8.json';

describe('Test of song-chord: ', () => {
    let durationInTicks = 5376;
    let ticksPerBeat = 384;
    let notesTrack1: NotesTrack[] = (<any>data1);
    let cScaleSong = new SongTonality(null, durationInTicks, ticksPerBeat, notesTrack1);
    let tonic1 = cScaleSong.tonics[9];

    let notesTrack2: NotesTrack[] = (<any>data2);
    let fMinorSong = new SongTonality(null, durationInTicks, ticksPerBeat, notesTrack2);
    let tonic2 = fMinorSong.tonics[9];

    durationInTicks = 281104;
    let notesTrack3: NotesTrack[] = (<any>data3);
    let yearCatSong = new SongTonality(null, durationInTicks, ticksPerBeat, notesTrack3);
    let tonic3 = yearCatSong.tonics[9];

    durationInTicks = 24240;
    ticksPerBeat = 256;
    let notesTrack4: NotesTrack[] = (<any>data4);
    let inven8Song = new SongTonality(null, durationInTicks, ticksPerBeat, notesTrack4);
    let tonic4 = inven8Song.tonics[1];
    beforeEach(() => {

    });
    it('An ascending C scale sequence has a tonality of C major', () => {
        expect(tonic1.pitch).toBe(0);
        expect(tonic1.mode).toBe(ScaleMode.Major);
    });
    it('An ascending F minor scale sequence has a tonality of F minor', () => {
        expect(tonic2.pitch).toBe(5);
        expect(tonic2.mode).toBe(ScaleMode.Minor);
    });
    it('Year of the cat first bars are in E minor', () => {
        expect(tonic3.pitch).toBe(4);
        expect(tonic3.mode).toBe(ScaleMode.Minor);
    });
    it('Bach Invention 8 first bars are in F major', () => {
        expect(tonic4.pitch).toBe(5);
        expect(tonic4.mode).toBe(ScaleMode.Major);
    });
});
