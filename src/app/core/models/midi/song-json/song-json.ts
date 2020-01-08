/* tslint:disable */
import { MidiEvent } from '../midi-event';
import { NotesTrack } from '../notes-track';
import { TrackRange } from '../track-range';
import { TrackNote } from '../track-note';
import { TimeSignature } from '../time-signature';
import { Track } from './track';
import { MidiEventType } from '../midi-codes/midi-event-type';


export class SongJson {
    format: number;
    ticksPerBeat: number;
    tracks: Track[];
    private _hash: string;  // This is an md5 hash calculated over the midi bytes of the original song
    private _durationInTicks: number = -1;
    private _notesTracks: NotesTrack[];
    private _durationInSeconds: number = -1;
    private _tempoEvents: MidiEvent[];
    private _timeSignature: TimeSignature;
    private _originalMidi: ArrayBuffer;


    constructor(
            format?: number, 
            ticksPerBeat?: number, 
            tracks?: MidiEvent[][], 
            hash?: string,
            midiBytes?: ArrayBuffer) {
        this.format = format;
        this.ticksPerBeat = ticksPerBeat;
        this.tracks = [];
        this._hash = hash;
        this._originalMidi = midiBytes;
        if (tracks) {
            for (let i = 0; i < tracks.length; i++) {
                this.tracks.push(new Track(tracks[i]));
            }
        }
    }

    get hash(): string {
        return this._hash;
    }

    get tracksCount(): number {
        return this.tracks.length;
    }
    get durationInTicks(): number {
        if (this._durationInTicks === -1) {
            this._durationInTicks = this.getSongDurationInTicks();
        }
        return this._durationInTicks;
    }

    get notesTracks(): NotesTrack[] {
        if (!this._notesTracks) {
            this._notesTracks = this.getNotesSequences();
        }
        return this._notesTracks;
    }

    get durationInSeconds(): number {
        if (this._durationInSeconds === -1) {
            this._durationInSeconds = this.getSongDurationInSeconds();
        }
        return this._durationInSeconds;
    }

    get tempoEvents(): MidiEvent[] {
        if (!this._tempoEvents) {
            this._tempoEvents = this.getTempoEvents();
        }
        return this._tempoEvents;
    }

    get timeSignature(): TimeSignature {
        if (!this._timeSignature) {
            this._timeSignature = this.getTimeSignature();
        }
        return this._timeSignature;
    }

    get originalMidi(): ArrayBuffer{
        return this._originalMidi;
    }

    // Returns the lowest and highest pitches in a track
    private getTrackRange(t: TrackNote[]): TrackRange {
        const returnValue = new TrackRange(500, 0);
        for (let i = 0; i < t.length; i++) {
            const pitch = t[i].pitch;
            if (pitch < returnValue.minPitch) { returnValue.minPitch = pitch; }
            if (pitch > returnValue.maxPitch) { returnValue.maxPitch = pitch; }
        }
        return returnValue;
    }

    // Returns the number of ticks in the whole song
    private getSongDurationInTicks(): number {
        let duration: number = 0;
        for (let i = 0; i < this._notesTracks.length; i++) {
            if (this._notesTracks[i].notesSequence.length > 0) {
                let trackLength: number = this._notesTracks[i].notesSequence.length;
                let lastNote: TrackNote = this._notesTracks[i].notesSequence[trackLength - 1]
                let timeStartsLastNote: number = lastNote.ticksFromStart;
                let durationLastNote = lastNote.duration;
                let endTrack: number = timeStartsLastNote + durationLastNote;
                if (endTrack > duration) {
                    duration = endTrack;
                }
            }
        }
        return duration;
    }
    private getSongDurationInSeconds(): number {
        let duration = 0;
        let tempoEvents = this.getTempoEvents();
        for (let i = 0; i < tempoEvents.length; i++) {
            let tempo: number = tempoEvents[i].tempoBPM;
            let start: number = tempoEvents[i].ticksSinceStart;
            let end: number;
            if (i < tempoEvents.length - 1) {
                end = tempoEvents[i + 1].ticksSinceStart;
            } else {
                end = this.getSongDurationInTicks();
            }
            duration += ((end - start) / this.ticksPerBeat) / (tempo / 60);
        }
        return duration;
    }
    private getTempoEvents(): MidiEvent[] {
        const returnArray: MidiEvent[] = [];
        const channelIndependentEvents = this.tracks[0].events;
        for (let i = 0; i < channelIndependentEvents.length; i++) {
            let event = channelIndependentEvents[i];
            if (event.isTempo()) {
                returnArray.push(event);
            }
        }
        return returnArray;
    }
    // Convert the midi tracks that have all sort of events, to tracks that have only notes on and notes off
    // In addition, a 'range' property provides the max and minimum pitch for each track
    private getNotesSequences(): NotesTrack[] {
        const musicTracks: NotesTrack[] = [];
        for (let i = 0; i < this.tracks.length; i++) {
            const TrackNotes = this.getNotes(this.tracks[i]);
            if (TrackNotes.length > 0) {
                let range: TrackRange = this.getTrackRange(TrackNotes);
                let instrument = this.tracks[i].Instrument;
                let channel = this.tracks[i].channel;
                musicTracks.push(new NotesTrack(TrackNotes, range, instrument, channel, i));
            }
        }
        return musicTracks;
    }

    // Used to get the events in a midi track that correspond to notes on and notes off
    private getNotes(midiTrack: Track): TrackNote[] {
        let returnArray: TrackNote[] = [];
        let timeSinceSongStart = 0;

        let noteEvents: MidiEvent[] = midiTrack.Notes;
        let bendEvents = midiTrack.getEventsOfType(MidiEventType.PitchBend);


        // Need to calculate the duration of each note. Must match noteOn with NoteOff events
        for (let i = 0; i < noteEvents.length; i++) {
            let midiEvent = noteEvents[i];
            timeSinceSongStart = midiEvent.ticksSinceStart;
            if (midiEvent.isNoteOn()) {
                // Find corresponding note off
                let originalPitch = midiEvent.param1;
                let originalVolume = midiEvent.param2;
                let currentPitch = originalPitch;
                let originalStart = midiEvent.ticksSinceStart;
                let currentStart = originalStart;
                let previousBend = 0;
                let isBent = false;
                let j = 1;
                while (noteEvents[i + j]) {
                    if ((noteEvents[i + j].isNoteOff() && noteEvents[i + j].param1 === originalPitch) ||
                        (noteEvents[i + j].param1 === originalPitch) && (noteEvents[i + j].param2 === 0)) {
                        break;
                    }
                    if (noteEvents[i + j].isPitchBend()) {
                        let currentBend = noteEvents[i + j].param2 - 0x40;
                        // If the maximum of 0x40 is reached, the displacement is 4 semitones
                        let displacementInSemitonesFromOriginalPitch = Math.round((currentBend) / 0x40 * 4);
                        let displacementInSemitonesFromPreviousPitch =
                            displacementInSemitonesFromOriginalPitch - Math.round((previousBend) / 0x40 * 4);
                        // If the acumulated bending reaches a semitone, end the current note and insert another
                        if (Math.abs(displacementInSemitonesFromPreviousPitch) > 0) {
                            let timeNoteEnd = noteEvents[i + j].ticksSinceStart;
                            returnArray = this.insertNote(currentStart, currentPitch, timeNoteEnd, returnArray, isBent, originalVolume);
                            currentPitch = originalPitch + displacementInSemitonesFromOriginalPitch;
                            currentStart = timeNoteEnd;
                            previousBend = currentBend;
                            isBent = true;
                        }
                    }
                    j++;
                }
                if (noteEvents[i + j]) {
                    let noteOffEvent = noteEvents[i + j];
                    let timeNoteEnd = noteOffEvent.ticksSinceStart;
                    returnArray = this.insertNote(currentStart, currentPitch, timeNoteEnd, returnArray, isBent, originalVolume);
                }
            }
        }
        return returnArray;
    }
    private insertNote(timeSinceStart: number, pitch: number, timeEnd: number,
        noteArray: TrackNote[], isBent: boolean, volume = 127): TrackNote[] {
        let duration = timeEnd - timeSinceStart;
        let note = new TrackNote(timeSinceStart, pitch, duration, isBent, volume);
        noteArray.push(note);
        return noteArray;
    }

    private getTimeSignature(): TimeSignature {
        for (let i = 0; i < this.tracks.length; i++) {
            let timeSignatureEvents = this.tracks[i].getEventsOfType(MidiEventType.TimeSignature)

            if (timeSignatureEvents.length > 0) {
                let timeSignature = timeSignatureEvents[0];
                let returnObject = new TimeSignature();
                returnObject.nn = timeSignature.param1;
                returnObject.dd = timeSignature.param2;
                returnObject.cc = timeSignature.param3;
                returnObject.bb = timeSignature.param4;
                return returnObject;
            }
        }
        return null;
    }

    public getTicksPerBar(): number {
        if (!this.timeSignature) {
            return 0; // if there is no time signature info, can't draw bars
        }
        switch (this.timeSignature.dd) {
            case 1: // beat is a half note
                return this.timeSignature.nn * this.ticksPerBeat * 2;
            case 2: // beat is a quarter note
                return this.timeSignature.nn * this.ticksPerBeat;
            case 3: // beat is a corchea
                return this.timeSignature.nn * this.ticksPerBeat / 2;
            default: // unknown
                return 0;
        }
    }
    
    public changeTempo(tempoBPM: number) {
        // we have to con convert from bits per minute to microseconds per beat
        let newTempo = 1000000 / (tempoBPM / 60);
        if (this.tempoEvents.length === 0) {
            // there are no tempo events, so the song has the default tempo that is 120 bpm
            // we add a new tempo event at the beginning
            this.tracks[0].events.push(new MidiEvent({
                delta: 0, type: 0xFF, subtype: 0x51, tempo: newTempo,
                tempoBPM: tempoBPM, ticksSinceStart: 0
            }));
        } else {
            // if there are tempo events compare the first one with the new tempo to obtain the ratio of change
            // then alter all tempo events with this ratio
            let changeRatio = tempoBPM / this.tempoEvents[0].tempoBPM;
            for (let i = 0; i < this.tempoEvents.length; i++) {
                this.tempoEvents[i].tempo /= changeRatio;
                this.tempoEvents[i].tempoBPM *= changeRatio;
            }
        }
    }

    // Returns a new song that is a slice of the current song, starting from a specific tick
    public getSliceStartingFromTick(tick: number, mutedTracks: number[], volumeTracks: number[], tempo: number): SongJson {
        let slice: SongJson = new SongJson(this.format, this.ticksPerBeat, null);
        slice.tracks = [];
        for (let i = 0; i < this.tracks.length; i++) {
            // if track is muted, ignore it
            if (mutedTracks.indexOf(i) > -1) {
                continue;
            }
            if (volumeTracks.length === 0) {
                slice.tracks.push(this.tracks[i].getSliceStartingFromTick(tick));
            }
            else {
                slice.tracks.push(this.tracks[i].getSliceStartingFromTick(tick, volumeTracks[i]));
            }

        }
        slice.changeTempo(tempo);
        return slice;
    }
}