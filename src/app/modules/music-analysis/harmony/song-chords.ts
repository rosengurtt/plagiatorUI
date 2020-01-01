// Represent the chords playing in each beat of a song
// There is one chord object per beat in the song

import { Chord } from './chord';
import { SongJson } from '../../../core/models/midi/song-json/song-json';
import { NotesTrack } from '../../../core/models/midi//notes-track';
import { Tonic } from './tonic';
import { ScaleMode } from './scale-mode.enum';
import { SongTonality } from './song-tonality';

export class SongChords {
    private chorditos: Chord[];
    private notesTracks: NotesTrack[];
    private songDurationInTicks: number;
    private songTicksPerBeat: number;
    private tonics: Tonic[];

    constructor(
        song?: SongJson,
        songDurationInTicks?: number,
        songTicksPerBeat?: number,
        notesTracks?: NotesTrack[]) {
        if (song) {
            this.notesTracks = song.notesTracks;
            this.songDurationInTicks = song.durationInTicks;
            this.songTicksPerBeat = song.ticksPerBeat;
        } else {
            this.notesTracks = notesTracks;
            this.songDurationInTicks = songDurationInTicks;
            this.songTicksPerBeat = songTicksPerBeat;
        }
    }

    get chords(): Chord[] {
        if (!this.chorditos) {
            this.chorditos = this.getChords();
        }
        return this.chorditos;
    }

    // Returns the chord that happens at beat n
    public getChordAtBeat(n: number): Chord {
        return this.chords[n];
    }
    // I call roman number the position of the root of the chord in the scale
    // This is traditionally written in roman numbers
    public getRomanNumberAtBeat(beat: number): number {
        if (!this.tonics) {
            const tonality = new SongTonality(null, this.songDurationInTicks, this.songTicksPerBeat, this.notesTracks);
            this.tonics = tonality.tonics;
        }
        const semitonesFromScaleTonic = (this.chorditos[beat].root - this.tonics[beat].pitch) % 12;
        switch (semitonesFromScaleTonic) {
            case 0:
                return 1;
            case 2:
                return 2;
            case 3:
                if (this.tonics[beat].mode === ScaleMode.Minor) {
                    return 3;
                }
                break;
            case 4:
                if (this.tonics[beat].mode === ScaleMode.Major) {
                    return 3;
                }
                break;
            case 5:
                return 4;
            case 7:
                return 5;
            case 8:
                if (this.tonics[beat].mode === ScaleMode.Minor) {
                    return 6;
                }
                break;
            case 9:
                return 6;
            case 10:
                if (this.tonics[beat].mode === ScaleMode.Minor) {
                    return 7;
                }
                break;
            case 11:
                return 7;
            default:
                return null;
        }
    }

    // We process the song to extract the succession of chords
    private getChords(): Chord[] {
        const TotalNumberBeats = Math.ceil(this.songDurationInTicks / this.songTicksPerBeat);
        // we create a first aproximation of 1 chord for each beat
        const firstTry: Chord[] = this.initializeArrayOfChords(TotalNumberBeats);
        for (const track of this.notesTracks) {
            // The drums channel data is not included in the chords
            if (track.channel === 9) {
                continue;
            }
            for (const note of track.notesSequence) {
                const startBeat = Math.round(note.ticksFromStart / this.songTicksPerBeat) + 1;
                // if duration is less than a beat, set endBeat to the next beat, otherwise we would ignore it
                let noteDuration = note.duration;
                if (noteDuration < this.songTicksPerBeat) { noteDuration = this.songTicksPerBeat; }
                const endBeat = Math.round((note.ticksFromStart + noteDuration) / this.songTicksPerBeat) + 1;
                try {
                    for (let k = startBeat; k < endBeat; k++) {
                        firstTry[k].add(note);
                    }
                } catch (dd) {
                }
            }
        }
        return firstTry;
    }

    private initializeArrayOfChords(dimension: number): Chord[] {
        const returnArray: Chord[] = new Array(dimension);
        for (let i = 0; i < dimension + 1; i++) {
            returnArray[i] = new Chord();
        }
        return returnArray;
    }
}
