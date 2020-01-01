// Finds what is the tonic in each bit of the song

import { SongJson } from '../../../core/models/midi/song-json/song-json';
import { TrackNote } from '../../../core/models/midi//track-note';
import { NotesTrack } from '../../../core/models/midi//notes-track';
import { Tonic } from './tonic';
import { ScaleMode } from './scale-mode.enum';

export class SongTonality {
    private tonicsSoret: Tonic[];
    private notesTracks: NotesTrack[];
    private songDurationInTicks: number;
    private songTicksPerBeat: number;
    private numberOfBeats: number;
    // This array has 24 rows, rows 0 to 11 correspond to tonalities C maj to B maj
    // 12 to 23 correspond to Cmin to B min
    // The second index corresponds to the beat in the song. So for ex.
    // p[4][7] is the probability that E maj is the tonic in beat 7
    private probabilities: number[][];
    // used to distinguish between a major scale and the corresponding minor
    // we save for each pitch, the sum of duration x volume in each beat
    private notePower: number[][];

    constructor(
        song?: SongJson,
        songDurationInTicksSoret?: number,
        songTicksPerBeat?: number,
        notesTracksSoret?: NotesTrack[]) {
        if (song) {
            this.notesTracks = song.notesTracks;
            this.songDurationInTicks = song.durationInTicks;
            this.songTicksPerBeat = song.ticksPerBeat;
        } else {
            this.notesTracks = notesTracksSoret;
            this.songDurationInTicks = songDurationInTicksSoret;
            this.songTicksPerBeat = songTicksPerBeat;
        }
        this.numberOfBeats = Math.round(this.songDurationInTicks / this.songTicksPerBeat);
    }

    get tonics() {
        if (!this.tonicsSoret) {
            this.analizeSong();
        }
        return this.tonicsSoret;
    }
    public getRepresentation(beat: number) {
        let returnValue: string;
        const tonic = this.tonics[beat];
        switch (tonic.pitch) {
            case 0:
                returnValue = 'C';
                break;
            case 1:
                if (tonic.mode === ScaleMode.Major) {
                    returnValue = 'Db';
                } else {
                    returnValue = 'C#';
                }
                break;
            case 2:
                returnValue = 'D';
                break;
            case 3:
                returnValue = 'Eb';
                break;
            case 4:
                returnValue = 'E';
                break;
            case 5:
                returnValue = 'F';
                break;
            case 6:
                returnValue = 'F#';
                break;
            case 7:
                returnValue = 'G';
                break;
            case 8:
                if (tonic.mode === ScaleMode.Major) {
                    returnValue = 'Ab';
                } else {
                    returnValue = 'G#';
                }
                break;
            case 9:
                returnValue = 'A';
                break;
            case 10:
                returnValue = 'Bb';
                break;
            case 11:
                returnValue = 'B';
                break;
        }
        if (tonic.mode === ScaleMode.Minor) {
            returnValue += ' min';
        }
        return returnValue;
    }

    private analizeSong() {
        this.tonicsSoret = [];
        this.probabilities = this.initializeProbabilitiesArray(24);
        this.notePower = this.initializeProbabilitiesArray(12);
        for (const track of this.notesTracks) {
            // The drums channel data is not included in the chords
            if (track.channel === 9) {
                continue;
            }
            const notesOfTrack: TrackNote[] = track.notesSequence;
            for (const note of notesOfTrack) {
                this.calculateProbabilitiesContributionOfNote(note);
            }
        }
        for (const track of this.notesTracks) {
            // The drums channel data is not included in the chords
            if (track.channel === 9) {
                continue;
            }
            const notesOfTrack: TrackNote[] = track.notesSequence;
            for (const note of notesOfTrack) {
                this.calculateProbabilitiesContributionOfNote(note);
            }
        }

        for (let beat = 1; beat <= this.numberOfBeats; beat++) {
            this.tonicsSoret[beat] = this.getTonicAtBeatFirstTry(beat);
        }
        this.correctMinorMajorProblem();
    }

    private initializeProbabilitiesArray(n: number): number[][] {
        const returnArray: number[][] = [];
        for (let i = 0; i < n; i++) {
            returnArray[i] = [];
            for (let beat = 1; beat <= this.numberOfBeats; beat++) {
                returnArray[i][beat] = 0;
            }
        }
        return returnArray;
    }

    // Increments the probabilities of the different possible tonics for beats that are up to 4 
    // beats away of the note
    // For example if a note of C is played on beat 8 until beat 10, it increments the probability 
    // that C, G, F, Bb, Eb, Am, Dm, Cm (scales that have a C note) are the tonic in beat 4 to 14
    // The contribution also depends on the volume and length of the note (so a passing note, that
    // may be actually out of the scale, will make a small contribution)
    private calculateProbabilitiesContributionOfNote(note: TrackNote, beatsWindow = 4) {
        const possibleTonics = this.getPossibleTonicsForNote(note.pitch);
        const noteStartBeat = Math.round(note.ticksFromStart / this.songTicksPerBeat) + 1;
        const noteEndBeat = Math.round((note.ticksFromStart + note.duration) / this.songTicksPerBeat) + 1;

        for (const possibleTonic of possibleTonics){
            for (let j = noteStartBeat - beatsWindow; j < noteEndBeat + beatsWindow; j++) {
                if (j < 1 || j > this.numberOfBeats) { continue; }
                this.probabilities[possibleTonic][j] += (note.duration * note.volume) / 100;
            }
        }

        for (let i = noteStartBeat; i < noteEndBeat; i++) {
            let durationInsideBeat = this.songTicksPerBeat;
            const ticksFromSongStartOfBeat = (i - 1) * this.songTicksPerBeat;
            if (note.ticksFromStart > ticksFromSongStartOfBeat) {
                durationInsideBeat -= (note.ticksFromStart - ticksFromSongStartOfBeat);
            }
            const noteEndTick = note.ticksFromStart + note.duration;
            const beatEndTick = ticksFromSongStartOfBeat + this.songTicksPerBeat;
            if (noteEndTick < beatEndTick) {
                durationInsideBeat -= (beatEndTick - noteEndTick);
            }
            this.notePower[note.pitch % 12][i] += note.volume * durationInsideBeat;

        }

    }
    // Given a pitch (for ex. C) return the indexes of the arrays that may be tonic, because their
    // scales include that pitch (in the example some possible tonics are F, G, Dm, that have indexes
    // of 5, 7 and 14 respectively)
    private getPossibleTonicsForNote(pitch: number): number[] {
        const returnArray = [];
        // Major scales
        returnArray.push(pitch % 12);
        returnArray.push((pitch + 7) % 12);
        returnArray.push((pitch + 5) % 12);
        returnArray.push((pitch + 10) % 12);
        returnArray.push((pitch + 15) % 12);
        returnArray.push((pitch + 20) % 12);
        returnArray.push((pitch + 1) % 12);
        // Minor scales
        returnArray.push((pitch % 12) + 12);
        returnArray.push((pitch + 1) % 12 + 12);
        returnArray.push((pitch + 2) % 12 + 12);
        returnArray.push((pitch + 3) % 12 + 12);
        returnArray.push((pitch + 4) % 12 + 12);
        returnArray.push((pitch + 5) % 12 + 12);
        returnArray.push((pitch + 7) % 12 + 12);
        returnArray.push((pitch + 9) % 12 + 12);
        returnArray.push((pitch + 10) % 12 + 12);

        return returnArray;
    }

    private getTonicAtBeatFirstTry(beat: number): Tonic {
        let maxProb = 0;
        const tonic: Tonic = new Tonic();
        for (let i = 0; i < 24; i++) {
            if (this.probabilities[i][beat] > maxProb) {
                maxProb = this.probabilities[i][beat];
                tonic.pitch = i % 12;
                if (i < 12) {
                    tonic.mode = ScaleMode.Major;
                } else {
                    tonic.mode = ScaleMode.Minor;
                }
            }
        }
        return tonic;
    }

    // Because the notes in a major scale are mostly the same as in the corresponding minor
    // we do this extra step to differentiate them
    private correctMinorMajorProblem() {
        for (let beat = 1; beat < this.numberOfBeats - 1; beat++) {
            // We only may have to make a correction when it was calculated as major
            if (this.tonicsSoret[beat].mode === ScaleMode.Major) {
                const pitchMajor = this.tonicsSoret[beat].pitch;
                const pitchMinor = (pitchMajor + 9) % 12;
                let j = 1;
                // find the next n consecutive beats with the same tonic
                while (this.tonicsSoret[beat + j].pitch === this.tonicsSoret[beat].pitch &&
                    this.tonicsSoret[beat + j].mode === this.tonicsSoret[beat].mode &&
                    beat + j < this.numberOfBeats) {
                    j++;
                }
                // calculate the total power of the tonic of the major scale and the power of
                // the tonic of the corresponding minor in the period
                let powerOfMaj = 0;
                let powerOfMin = 0;
                for (let i = beat; i < beat + j - 1; i++) {
                    powerOfMaj += this.notePower[pitchMajor][i];
                    powerOfMin += this.notePower[pitchMinor][i];
                }

                // we now compare the 2 powers to decide which one is correct
                if (powerOfMin > powerOfMaj) {
                    for (let i = beat; i < beat + j - 1; i++) {
                        this.tonicsSoret[i].pitch = pitchMinor;
                        this.tonicsSoret[i].mode = ScaleMode.Minor;
                    }
                }
            }

        }
    }
}