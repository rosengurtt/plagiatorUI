/* tslint:disable */
import { Injectable } from '@angular/core';

import { Md5 } from 'ts-md5/dist/md5';
import { SongJson } from './song-json';
import { MidiEvent } from '../midi-event';
import { Track } from './track';
import { ConcatenateUint8Array } from '../../../helpers/concatenate-uint8array';
import { Binary2base64 } from '../../../helpers/binary-to-base64';

const MIDIFile: any = require('midifile');

@Injectable()
export class Midi2JsonService {


    private addTimeSinceBeginningField(track: any): Track {
        let timeSinceBeginning = 0;
        const returnValue: Track = new Track([]);
        for (const event of track) {
            timeSinceBeginning += event.delta;
            const midiEventItem = new MidiEvent();
            midiEventItem.delta = event.delta;
            midiEventItem.ticksSinceStart = timeSinceBeginning;
            midiEventItem.index = event.index;
            midiEventItem.length = event.length;
            midiEventItem.param1 = event.param1;
            midiEventItem.param2 = event.param2;
            midiEventItem.param3 = event.param3;
            midiEventItem.param4 = event.param4;
            midiEventItem.subtype = event.subtype;
            midiEventItem.type = event.type;
            midiEventItem.data = event.data;
            midiEventItem.tempo = event.tempo;
            midiEventItem.tempoBPM = event.tempoBPM;
            midiEventItem.channel = event.channel;
            midiEventItem.key = event.key;
            midiEventItem.scale = event.scale;
            returnValue.events.push(midiEventItem);
        }
        return returnValue;
    }

    // Creates a new array of tracks with the following properties:
    // The track 0 has all the events that are channel independent, like time signature, tempo changes, etc.
    // The rest of the tracks have channel dependent data, with events of only one channel in each track
    // If a channel is used for different instruments (in other words, there are patch change events),
    // each instrument has its own track.
    // If there are no patch change events, it would default to instrument 1 (piano). But we add a
    // patch change event so we make the assignment to the piano explicit
    // We order the tracks on ascending order of instruments, except for the drums track 
    // (that uses channel 10) that goes at the end
    private normalizeSongJson(song: SongJson): SongJson {
        const returnObject = new SongJson(song.format, song.ticksPerBeat, [], song.hash);

        returnObject.tracks.push(this.getTrackWithChannelIndependentEvents(song));

        for (let i = 0; i < 16; i++) {
            const tracks = this.getTracksWithEventsOfChannel(i, song);
            for (let t of tracks) {
                returnObject.tracks.push(t);
            }
        }
        song = this.mergeTracksWhenPlayingSameInstrumentInSameChannel(returnObject);
        return this.sortTracks(returnObject);
    }

    private sortTracks(song: SongJson): SongJson {
        const tracksNo = song.tracks.length;
        // Find drums track and send it to the end
        // Start with the second track, because the first has channel independent events
        for (let i = 1; i < tracksNo; i++) {
            if (song.tracks[i].channel === 9) {
                const aux = song.tracks[i];
                for (let j = 0; j < tracksNo - i - 1; j++) {
                    song.tracks[i + j] = song.tracks[i + j + 1]
                }
                song.tracks[tracksNo - 1] = aux;
                break;
            }
        }
        // Since there are only a few, it is not worth to use a quickSort
        for (let i = 1; i < tracksNo - 1; i++) {
            for (let j = i + 1; j < tracksNo - 1; j++) {
                if (song.tracks[i].Instrument > song.tracks[j].Instrument) {
                    let aux = song.tracks[i];
                    song.tracks[i] = song.tracks[j];
                    song.tracks[j] = aux;
                }
            }
        }
        return song;
    }

    // To avoid having unnecessary tracks, if there are 2 tracks playing the same instrument
    // in the same channel in different places of the song, they can be merged into one
    private mergeTracksWhenPlayingSameInstrumentInSameChannel(song: SongJson): SongJson {
        for (let i = 1; i < song.tracks.length; i++) {
            for (let j = i + 1; j < song.tracks.length; j++) {
                if (song.tracks[i].Instrument === song.tracks[j].Instrument &&
                    song.tracks[i].channel === song.tracks[j].channel) {
                    if (!this.tracksHaveNotesInSameBar(song.tracks[i], song.tracks[j], song.ticksPerBeat)) {
                        // conditions for merging are met for tracks i and j
                        song = this.mergeTracks(song, i, j);
                    }
                }
            }
        }
        return song;
    }

    // merges 2 tracks that have the same channel and instrument into 1
    private mergeTracks(song: SongJson, indexTrack1: number, indexTrack2: number): SongJson {
        const track1 = song.tracks[indexTrack1];
        const track2 = song.tracks[indexTrack2];
        // if index numbers are wrong, don't do anything
        if (indexTrack1 > song.tracks.length - 1 ||
            indexTrack2 > song.tracks.length - 1) {
            return song;
        }
        // insert events from track2 in track1
        let i = 0;  // couneter for track1
        let j = 0; // counter for track 2

        while (j < track2.events.length) {
            const event = track2.events[j];
            while (track1.events[i].ticksSinceStart < event.ticksSinceStart &&
                i < track1.events.length - 1) {
                i++;
            }
            event.delta = event.ticksSinceStart - track1.events[i].ticksSinceStart;
            i++; // Now i has the value where we want to insert the event
            track1.events.splice(i, 0, event);
            j++;
        }
        // remove track2
        song.tracks.splice(indexTrack2, 1);
        return song;
    }

    // Used to check if 2 tracks can be merged. We want to merge only them if they never play both
    // in the same bar
    private tracksHaveNotesInSameBar(track1: Track, track2: Track, ticksPerBar: number): boolean {
        const lastEventTrack1 = track1.events[track1.events.length - 1];
        const lastEventTrack2 = track2.events[track2.events.length - 1];
        const tickOfLastEventToCheck = lastEventTrack1.ticksSinceStart > lastEventTrack2.ticksSinceStart ?
            lastEventTrack2.ticksSinceStart : lastEventTrack1.ticksSinceStart;
        // check in each bar
        for (let i = 0; i <= tickOfLastEventToCheck / ticksPerBar; i++) {
            if (this.trackHasNotesInBar(track1, i, ticksPerBar) &&
                this.trackHasNotesInBar(track2, i, ticksPerBar)) {
                return true;
            }
        }
        return false;
    }

    private trackHasNotesInBar(track: Track, bar: number, ticksPerBar: number) {
        for (const event of track.events) {
            if (event.isNote() &&
                event.ticksSinceStart >= ((bar - 1) * ticksPerBar) &&
                event.ticksSinceStart <= ((bar) * ticksPerBar)) {
                return true;
            }
        }
        return false;
    }

    // Returns an array of tracks that has all the events corresponding to a specific channel, from any of the original tracks
    // When there are no events for the channel, it returns an empty array
    // When there are events for this channel, but no patch change events, it returns an array with one track
    // Otherwise returns an array of tracks with as many tracks as different instruments
    private getTracksWithEventsOfChannel(channel: number, song: SongJson): Track[] {
        const returnObject: Track[] = [];
        // First look for all events of this channel and put them on an array
        let channelEvents: MidiEvent[] = [];
        for (let i = 0; i < song.tracksCount; i++) {
            for (const event of song.tracks[i].events) {
                if (event.channel === channel && !event.isChannelIndependent()) {
                    const clonedEvent = new MidiEvent(event);
                    channelEvents.push(clonedEvent);
                }
            }
        }
        if (channelEvents.length === 0) {
            return returnObject;
        }
        // Now we sort the events
        channelEvents = this.sortAndFixDeltasOfTrack(channelEvents);

        // We split now in different tracks if there are patch change events
        returnObject.push(new Track([]));
        let currentTrack: Track = returnObject[returnObject.length - 1];
        // We need this variable because there may be no patch changes events, and the instrument default to the piano
        let patchChangesEventsSoFar = 0;
        for (const channelEvent of channelEvents) {
            const event = new MidiEvent(channelEvent);
            if (event.isPatchChange()) {
                if (patchChangesEventsSoFar > 0) {
                    // Terminate this track
                    currentTrack.addEndOfTrackEvent();
                    // Add new track
                    returnObject.push(new Track([]));
                    currentTrack = returnObject[returnObject.length - 1];
                    // We have to update the delta because this will be the first event of the new track
                    event.delta = event.ticksSinceStart;
                } else {
                    patchChangesEventsSoFar++;
                }
            }
            // Add event to the end of last track of the returnObject array
            currentTrack.events.push(event);
        }
        // If there aren't any patch events, it means it will default to a piano (instrument 1)
        // We add a patch event at the beginning, to make this explicit
        if (patchChangesEventsSoFar === 0) {
            currentTrack.events.unshift(new MidiEvent({
                delta: 0, type: 8, subtype: 12, ticksSinceStart: 0, param1: 1
            }));
        }
        // Terminate the last track
        currentTrack.addEndOfTrackEvent();
        return this.removeTracksWithoutNotes(returnObject);
    }
    private removeTracksWithoutNotes(tracks: Track[]): Track[] {
        let i = 0;
        while (i < tracks.length) {
            if (tracks[i].Notes.length === 0) {
                tracks.splice(i, 1);
            } else {
                i++;
            }
        }
        return tracks;
    }

    private getTrackWithChannelIndependentEvents(song: SongJson): Track {
        // First look for all events not channel specific and put them on a single track
        // Initially the events may be out of order, because they may come from different tracks
        const returnTrack = new Track([]);
        for (let i = 0; i < song.tracksCount; i++) {
            for (const event of song.tracks[i].events) {
                if (event.isChannelIndependent()) {
                    const clonedEvent = new MidiEvent(event);
                    returnTrack.events.push(clonedEvent);
                }
            }
        }
        returnTrack.events = this.sortAndFixDeltasOfTrack(returnTrack.events);
        returnTrack.addEndOfTrackEvent();
        return returnTrack;
    }

    private sortAndFixDeltasOfTrack(events: MidiEvent[]): MidiEvent[] {
        let returnArray: MidiEvent[] = [];
        // Sort
        returnArray = events.sort((a: MidiEvent, b: MidiEvent) => {
            if (a.ticksSinceStart < b.ticksSinceStart) {
                return -1;
            } else if (a.ticksSinceStart > b.ticksSinceStart) {
                return 1;
            } else {
                return 0;
            }
        });
        // Fix deltas
        for (let i = 1; i < returnArray.length; i++) {
            returnArray[i].delta = returnArray[i].ticksSinceStart - returnArray[i - 1].ticksSinceStart;
        }

        return returnArray;
    }

    private getMidiHeader(tracks, ticksPerBeat): Uint8Array {
        const buffer = new Uint8Array(14);
        buffer[0] = 0x4D;
        buffer[1] = 0x54;
        buffer[2] = 0x68;
        buffer[3] = 0x64;
        buffer[4] = 0x00;
        buffer[5] = 0x00;
        buffer[6] = 0x00;
        buffer[7] = 0x06;
        buffer[8] = 0x00;
        buffer[9] = 0x01;
        buffer[10] = tracks >> 8;
        buffer[11] = tracks & 0xFF;
        buffer[12] = ticksPerBeat >> 8;
        buffer[13] = ticksPerBeat & 0xFF;
        return buffer;
    }

    private getMidiTrackBytes(track: Track): Uint8Array {
        const trackHeaderLength = 8;
        // Reserve a space that is enough for sure for the array
        const maxLength = track.events.length * 15 + 100;
        const buffer = new Uint8Array(maxLength);
        // Magic word of Midi File
        buffer[0] = 0x4D;
        buffer[1] = 0x54;
        buffer[2] = 0x72;
        buffer[3] = 0x6B;
        let j = trackHeaderLength; // points to next index in buffer
        // bytes 4 to 7 is the length of the track that we still don't know
        for (let i = 0; i < track.events.length; i++) {
            let deltaLength: number;
            const event = track.events[i];
            const delta: number = event.delta;

            // Delta time calculation. Delta is written in groups of 7 bits, not bytes
            const indexAtBeginningOfEvent = j;
            if (delta > (0x80 * 0x80 * 0x80)) {
                buffer[j++] = (delta >> 21) & 0x7F | 0x80;
            }
            if (delta > (0x80 * 0x80)) {
                buffer[j++] = (delta >> 14) & 0x7F | 0x80;
            }
            if (event.delta > 0x80) {
                buffer[j++] = (delta >> 7) & 0x7F | 0x80;
            }
            buffer[j++] = delta & 0x7F;
            deltaLength = j - indexAtBeginningOfEvent;
            // note on
            if (event.isNoteOn()) {
                buffer[j++] = 0x90 | event.channel;
                buffer[j++] = event.param1;
                buffer[j++] = event.param2;
                continue;
            }
            // note off
            if (event.isNoteOff()) {
                buffer[j++] = 0x80 | event.channel;
                buffer[j++] = event.param1;
                buffer[j++] = event.param2;
                continue;
            }
            // pressure change
            if (event.isPressureChange()) {
                buffer[j++] = 0xD0 | event.channel;
                buffer[j++] = event.param1;
                buffer[j++] = event.param2;
                continue;
            }
            // bending
            if (event.isPitchBend()) {
                buffer[j++] = 0xE0 | event.channel;
                buffer[j++] = event.param1;
                buffer[j++] = event.param2;
                continue;
            }
            // tempo
            if (event.isTempo()) {
                buffer[j++] = 0xFF;
                buffer[j++] = 0x51;
                buffer[j++] = 0x03;
                let tempo = event.tempo;
                if (tempo > (0x1000000)) {
                    buffer[j++] = (tempo >> 24) & 0xFF;
                }
                if (tempo > 0x10000) {
                    buffer[j++] = (tempo >> 16) & 0xFF;
                }
                if (tempo > 0x100) {
                    buffer[j++] = (tempo >> 8) & 0xFF;
                }
                buffer[j++] = tempo & 0xFF;
                continue;
            }
            // Modulation
            if (event.isModulation()) {
                buffer[j++] = 0xB0 | event.channel;
                buffer[j++] = event.param1;
                buffer[j++] = event.param2;
                continue;
            }
            // Patch change (instrument)
            if (event.isPatchChange()) {
                buffer[j++] = 0xC0 | event.channel;
                buffer[j++] = event.param1;
                continue;
            }
            // Volume change (setea volumen global del track)
            if (event.isVolumeChange()) {
                buffer[j++] = 0xB0 | event.channel;
                buffer[j++] = 0x07;
                buffer[j++] = event.param2;
                continue;
            }
            // Pan change (setea volumenes relativos de izq y der)
            if (event.isPanChange()) {
                buffer[j++] = 0xB0 | event.channel;
                buffer[j++] = 0x0A;
                buffer[j++] = event.param2;
                continue;
            }
            // Reset all controllers
            if (event.isResetAllControllers()) {
                buffer[j++] = 0xB0 | event.channel;
                buffer[j++] = 0x79;
                buffer[j++] = 0x00;
                continue;
            }
            // Effect 1 Depth ( Usually controls reverb send amount)
            if (event.isEffect1Depht()) {
                buffer[j++] = 0xB0 | event.channel;
                buffer[j++] = 0x5B;
                buffer[j++] = event.param2;
                continue;
            }
            // Effect 3 Depth( Usually controls chorus amount)
            if (event.isEffect3Depht()) {
                buffer[j++] = 0xB0 | event.channel;
                buffer[j++] = 0x5D;
                buffer[j++] = event.param2;
                continue;
            }
            // Midi Port
            if (event.isMidiPort()) {
                buffer[j++] = 0xFF;
                buffer[j++] = 0x21;
                buffer[j++] = 0x01;
                buffer[j++] = event.data[0];
                continue;
            }
            // Key Signature
            if (event.isKeySignature()) {
                buffer[j++] = 0xFF;
                buffer[j++] = 0x59;
                buffer[j++] = 0x02;
                buffer[j++] = event.key;
                buffer[j++] = event.scale;
                continue;
            }
            // Time Signature
            if (event.isTimeSignature()) {
                buffer[j++] = 0xFF;
                buffer[j++] = 0x58;
                buffer[j++] = 0x04;
                buffer[j++] = event.param1;
                buffer[j++] = event.param2;
                buffer[j++] = event.param3;
                buffer[j++] = event.param4;
                continue;
            }
            // End of Track
            if (event.isEndOfTrack() && (i === track.events.length - 1)) {
                buffer[j++] = 0xFF;
                buffer[j++] = 0x2F;
                buffer[j++] = 0x00;
                continue;
            }
            // We ignore this event
            j -= deltaLength;
        };
        // End of track
        // Now that we know the track length, save it
        const trackLength = j - trackHeaderLength; // has to substract 8 because the length is measured not from
        // the beginning of the track, but from the first byte after
        // the length bytes

        buffer[4] = this.getNthByteOfInteger(trackLength, 3);
        buffer[5] = this.getNthByteOfInteger(trackLength, 2);
        buffer[6] = this.getNthByteOfInteger(trackLength, 1);
        buffer[7] = this.getNthByteOfInteger(trackLength, 0);
        return buffer.slice(0, trackLength + trackHeaderLength); // The length of the buffer includes the header and the bytes of the length
    }

    private getNthByteOfInteger(integer, n) {
        return Math.floor(integer / (Math.pow(0x100, n))) & 0xFF;
    }

    // Converts from binary midi to json version
    // Uses an external library "midiFile"
    public getMidiObject(readBuffer: ArrayBuffer): SongJson {
        // Creating the MIDIFile instance
        const midiFile = new MIDIFile(readBuffer);
        const format: number = midiFile.header.getFormat(); // 0, 1 or 2
        const ticksPerBeat: number = midiFile.header.getTicksPerBeat();
        const base64 = Binary2base64.convert(readBuffer);
        const hash = Md5.hashStr(base64).toString();
        let returnObject = new SongJson(format, ticksPerBeat, [], hash);
        const tracksCount: number = midiFile.header.getTracksCount();

        for (let i = 0; i < tracksCount; i++) {
            // The external library "midiFile" produces a json object that is bascically
            // a set of tracks, each containing a sequence of events. 
            // We add an extra property to each event, that is the time in ticks 
            // since the beginning of the song
            returnObject.tracks[i] = this.addTimeSinceBeginningField(midiFile.getTrackEvents(i));
        }
        returnObject = this.normalizeSongJson(returnObject);
        return returnObject;
    };

    // converts from json version to binary midi
    public getMidiBytes(midiObject: SongJson) {
        let buffer = this.getMidiHeader(midiObject.tracks.length, midiObject.ticksPerBeat);
        for (const mo of midiObject.tracks) {
            const bufferTrack = this.getMidiTrackBytes(mo);
            buffer = ConcatenateUint8Array.concat(buffer, bufferTrack);
        };
        return buffer;
    }


}