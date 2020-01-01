// The chord class is defined by the notes playing in the chord
// Tipically the notes are the ones playing during a beat, they may
// actually play for more than a beat (and in that case the same notes belong
// to other chords, or only for part of the beat)
import { TrackNote } from '../../../core/models/midi/track-note';
import { ChordType } from './chord-type.enum';
import { AlterationType } from './alteration-type.enum';

export class Chord {
    private pichis: number[];
    private intervalitos: number[]; // A place to save them, so they don't have to be recalculated
    private notitas: TrackNote[];
    private chordTipo: ChordType;
    private passingNotas: TrackNote[] = []; // These are notes that are not actually part of the chord
    private rootito: number;
    private totalPowerito: number; // This is the sum of volume*duration of all notes
    public startTime: number;
    public duration: number;

    constructor(notes: TrackNote[] = [], start = 0, dur = 0) {
        if (notes) {
            this.notitas = notes.sort((n1: TrackNote, n2: TrackNote) => n1.pitch - n2.pitch);
        } else {
            this.notitas = [];
        }
        this.startTime = start;
        this.duration = dur;
    }

    public add(note: TrackNote) {
        // If we already have a note with this pitch, don't add it
        for (const nota of this.notitas) {
            if (nota.pitch === note.pitch) { return; }
        }
        this.notitas.push(note);
        this.notitas = this.notitas.sort((n1: TrackNote, n2: TrackNote) => n1.pitch - n2.pitch);
    }

    public removeAt(i: number) {
        if (i < 0 || i >= this.notitas.length) { return; }
        this.resetCalculatedValues();
        this.notitas.splice(i, 1);
        this.notitas = this.notitas.sort((n1: TrackNote, n2: TrackNote) => n1.pitch - n2.pitch);
    }
    private resetCalculatedValues() {
        this.pichis = null;
        this.intervalitos = null;
        this.chordTipo = null;
        this.totalPowerito = null;
    }
    get notes() {
        return this.notitas;
    }
    get pitches() {
        if (!this.pichis) {
            this.pichis = [];
            for (const nota of this.notitas) {
                this.pichis.push(nota.pitch);
            }
        }
        return this.pichis;
    }

    get totalPower() {
        if (!this.totalPowerito) {
            this.totalPowerito = this.calculateTotalPower();
        }
        return this.totalPowerito;
    }

    public getLower(): number {
        return this.pitches[0];
    }
    public getHigher(): number {
        return this.pitches[this.pitches.length - 1];
    }
    public isMajor(): boolean {
        if (this.chordType === ChordType.Major || this.chordType === ChordType.Major7 ||
            this.chordType === ChordType.Major9) {
            return true;
        }
        return false;
    }
    public isMinor(): boolean {
        if (this.chordType === ChordType.Minor || this.chordType === ChordType.Minor7 ||
            this.chordType === ChordType.Minor7Major || this.chordType === ChordType.Minor9) {
            return true;
        }
        return false;
    }

    get chordType() {
        if (!this.chordTipo) {
            this.analizeChord();
        }
        return this.chordTipo;
    }
    // For example Major, Minor, Major 7
    public getType(intervals): ChordType {

        // Basic Triads
        if (this.equal(intervals, [4, 7]) || this.equal(intervals, [0, 4, 7])) {
            return ChordType.Major;
        }
        if (this.equal(intervals, [3, 7]) || this.equal(intervals, [0, 3, 7])) {
            return ChordType.Minor;
        }
        if (this.equal(intervals, [5, 7]) || this.equal(intervals, [0, 5, 7])) {
            return ChordType.Sus;
        }
        if (this.equal(intervals, [7]) || this.equal(intervals, [0, 7])) {
            return ChordType.Power;
        }
        if (this.equal(intervals, [4, 8]) || this.equal(intervals, [0, 4, 8])) {
            return ChordType.Augmented;
        }
        if (this.equal(intervals, [3, 6]) || this.equal(intervals, [0, 3, 6]) ||
            this.equal(intervals, [3, 6, 9]) || this.equal(intervals, [0, 3, 6, 9])) {
            return ChordType.Diminished;
        }

        // 7ths
        if (this.equal(intervals, [4, 7, 11]) || this.equal(intervals, [0, 4, 7, 11])) {
            return ChordType.Major7;
        }
        if (this.equal(intervals, [3, 7, 10]) || this.equal(intervals, [0, 3, 7, 10])) {
            return ChordType.Minor7;
        }
        if (this.equal(intervals, [3, 7, 11]) || this.equal(intervals, [0, 3, 7, 11])) {
            return ChordType.Minor7Major;
        }
        if (this.equal(intervals, [3, 6, 10]) || this.equal(intervals, [0, 3, 6, 10])) {
            return ChordType.HalfDiminished;
        }
        if (this.equal(intervals, [4, 7, 10]) || this.equal(intervals, [0, 4, 7, 10])) {
            return ChordType.Dominant7;
        }

        // 9ths
        if (this.equal(intervals, [2, 4, 7, 11]) || this.equal(intervals, [0, 2, 4, 7, 11]) ||
            this.equal(intervals, [2, 4, 11]) || this.equal(intervals, [0, 2, 4, 11]) ||
            this.equal(intervals, [2, 4, 7]) || this.equal(intervals, [0, 2, 4, 7]) ||
            this.equal(intervals, [2, 7, 11]) || this.equal(intervals, [0, 2, 7, 11])) {
            return ChordType.Major9;
        }
        if (this.equal(intervals, [2, 3, 7, 10]) || this.equal(intervals, [0, 2, 3, 7, 10]) ||
            this.equal(intervals, [2, 3, 10]) || this.equal(intervals, [0, 2, 3, 10]) ||
            this.equal(intervals, [2, 3, 7]) || this.equal(intervals, [0, 2, 3, 7]) ||
            this.equal(intervals, [2, 7, 10]) || this.equal(intervals, [0, 2, 7, 10])) {
            return ChordType.Minor9;
        }
        return ChordType.Unknown;
    }

    private equal(a: number[], b: number[]): boolean {
        if (a.length !== b.length) { return false; }
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) { return false; }
        }
        return true;
    }

    // representation is the chord written in standard notation, like Am7 or C#m9
    // the parameter sharpOrFlat is used when the root can be represented for ex. by
    // C# or Db
    public getRepresentation(sharpOrFlat: AlterationType): string {
        if (this.chordType !== ChordType.Unknown && this.chordType !== ChordType.NotAchord) {
            return this.getRootRepresentation(sharpOrFlat) + this.getTypeRepresentation();
        }
        return '';
    }

    private getRootRepresentation(sharpOrFlat: AlterationType): string {
        switch (this.root % 12) {
            case 0: return 'C';
            case 1:
                if (sharpOrFlat === AlterationType.sharp) {
                    return 'C#';
                } else { return 'Db'; }
            case 2: return 'D';
            case 3:
                if (sharpOrFlat === AlterationType.sharp) {
                    return 'D#';
                } else { return 'Eb'; }
            case 4: return 'E';
            case 5: return 'F';
            case 6:
                if (sharpOrFlat === AlterationType.sharp) {
                    return 'F#';
                } else { return 'Gb'; }
            case 7: return 'G';
            case 8:
                if (sharpOrFlat === AlterationType.sharp) {
                    return 'G#';
                } else { return 'Ab'; }
            case 9: return 'A';
            case 10:
                if (sharpOrFlat === AlterationType.sharp) {
                    return 'A#';
                } else { return 'Bb'; }
            case 11: return 'B';
        }
    }
    private getTypeRepresentation(): string {
        switch (this.chordType) {
            case ChordType.Major: return '';
            case ChordType.Minor: return 'm';
            case ChordType.Sus: return 'sus';
            case ChordType.Augmented: return 'aug';
            case ChordType.Diminished: return 'dim';
            case ChordType.Major7: return 'maj7';
            case ChordType.Minor7: return 'm7';
            case ChordType.Major9: return 'maj9';
            case ChordType.Minor9: return 'm9';
            case ChordType.Dominant7: return '7';
            case ChordType.Minor7Major: return 'mM7';
            case ChordType.HalfDiminished: return 'm7b5';
            case ChordType.Power: return '5';
        }
    }



    // private getIntervalsFromRoot(): number[] {
    //     let rootIndex = this.getRootIndex();
    //     return this.intervalsFromNote(rootIndex);
    // }
    get root() {
        if (!this.rootito) {
            this.analizeChord();
        }
        return this.rootito;
    }


    // Gilven the index of the note in the notes array, returns the intervals from this note to the
    // other notes in the chord.
    // For the notes with lower pitch (compared with the reference), instead of returning a negative
    // number, it returns the "complement".
    // For ex. for a negative value of -5 (a forth below), it calculates +7 (a fifth above)
    private intervalsFromNote(i: number): number[] {
        let returnArray = [];
        for (const nota of this.notes) {
            // Absolute distance
            let interval = nota.pitch - this.notes[i].pitch;
            // Distance in less than an octave
            interval = interval % 12;
            // Calculate the complement if negative
            if (interval < 0) {
                interval += 12;
            }
            returnArray.push(interval);
        }
        // Remove duplicates
        returnArray = Array.from(new Set(returnArray));
        returnArray = returnArray.sort((n1: number, n2: number) => n1 - n2);
        return returnArray;
    }
    get intervals(): number[] {

        if (!this.intervalitos) {
            this.intervalitos = [];
            for (let i = 0; i < this.pitches.length - 1; i++) {
                for (let j = i + 1; j < this.pitches.length; j++) {
                    this.intervalitos.push((this.pitches[j] - this.pitches[i]) % 24);
                }
            }
            // Sort array
            this.intervalitos = this.intervalitos.sort((n1: number, n2: number) => n1 - n2);
            // Remove duplicates
            this.intervalitos = Array.from(new Set(this.intervalitos));
        }
        return this.intervalitos;
    }

    // We want to find the root and the type of the chord
    private analizeChord() {
        if (this.notes.length < 2) {
            this.chordTipo = ChordType.NotAchord;
            if (this.notes.length === 1) {
                this.rootito = this.notes[0].pitch;
            } else {
                this.rootito = null;
            }
            return;
        }

        // We iterate considering each note to be the root, until we identify a known chord type
        // If we can't find a known type, we remove a note and try again until we find a known type
        const testChord = new Chord(this.notes);
        while (testChord.notes.length > 1) {
            const probabilityOfNotBeingApassingNote: number[] = new Array(testChord.notes.length);
            for (let i = 0; i < testChord.notes.length; i++) {
                const intervals = testChord.intervalsFromNote(i);
                probabilityOfNotBeingApassingNote[i] = this.calculateProbabilityOfNotBeingPassingNote(i);
                const chordType = this.getType(intervals);
                if (chordType !== ChordType.Unknown) {
                    // Check that the root would not be too short compared with the other notes
                    const powerThisNote = this.calculateNotePower(i);
                    if ((powerThisNote / this.totalPower) < (1 / this.notes.length) * 0.5) {
                        continue;
                    }
                    this.rootito = testChord.notes[i].pitch;
                    this.chordTipo = chordType;
                    return;
                }
            }
            // if we reach this point, it means we couldn't match the chord to a known type
            // we start removing notes and try again
            const passingNoteIndex = this.getIndexOfNoteMoreLikelyToBeApassingNote(probabilityOfNotBeingApassingNote);
            this.passingNotas.push(testChord.notes[passingNoteIndex]);
            testChord.notes.splice(passingNoteIndex, 1);
        }

    }

    private calculateProbabilityOfNotBeingPassingNote(index: number): number {
        let probability = 0;
        const intervals = this.intervalsFromNote(index);
        // Calculate probability based in the pitch (comparing with the other pitches)
        for (const interval of intervals) {
            switch (interval) {
                case 0:
                    probability += 10;
                    break;
                case 7:
                    probability += 8;
                    break;
                case 3:
                case 4:
                    probability += 4;
                    break;
                case 10:
                case 11:
                    probability += 3;
                    break;
                case 5:
                case 1:
                case 2:
                    probability += 2;
                    break;
                case 8:
                case 9:
                    probability += 1;
                    break;
                case 6:
                    probability -= 7;
                    break;
            }
        }
        // Calculate probability based in the duration and volume
        // Passing notes are often short
        const powerThisPitch = this.calculateNotePower(index);
        return probability * (powerThisPitch / this.totalPower);
    }

    private getIndexOfNoteMoreLikelyToBeApassingNote(probabilities: number[]): number {
        const min = Math.min(...probabilities);
        for (let i = 0; i < probabilities.length; i++) {
            if (min === probabilities[i]) {
                return i;
            }
        }
    }
    // Calculates the sum of duration * volume of all notes in the chord
    private calculateTotalPower() {
        let totalPower = 0; // This is the sum of duration*volume
        for (const nota of this.notes) {
            totalPower += (nota.duration * nota.volume);
        }
        return totalPower;
    }

    // Calculate the sum of duration * volume for all nothes with a specific pitch (for ex. all C notes)
    private calculateNotePower(index: number) {
        let notePower = 0;
        for (const nota of this.notes) {
            if (nota.pitch % 12 === this.notes[index].pitch % 12) {
                notePower += (nota.duration * nota.volume);
            }
        }
        return notePower;
    }
}
