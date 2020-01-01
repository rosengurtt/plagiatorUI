import { Midi2JsonService } from './midi-to-json.service';
import { Uint8Array2ArrayBuffer } from '../../../core/helpers/uint8array-to-arraybuffer';
import { MidiFileCheckerService } from './midi-file-checker.service';
import { SongJson } from '../../../core/models/midi/song-json/song-json';
import { MidiEvent } from '../../../core/models/midi/midi-event';
import { Track } from '../../../core/models/midi/song-json/track';


describe('Test of Midi2JsonService: midi -> json', () => {
    let service: Midi2JsonService;
    const midiBytesOfSongWithTwoTracks: ArrayBuffer = Uint8Array2ArrayBuffer.convert(
        new Uint8Array([0x4D, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x01, 0x00, 0x02,
            0x01, 0xE0, 0x4D, 0x54, 0x72, 0x6B, 0x00, 0x00, 0x00, 0x48, 0x00, 0xFF, 0x58, 0x04, 0x04, 0x02,
            0x18, 0x08, 0x00, 0xFF, 0x59, 0x02, 0x01, 0x00, 0x00, 0xB0, 0x79, 0x00, 0x00, 0xC0, 0x00, 0x00,
            0xB0, 0x07, 0x64, 0x00, 0x0A, 0x40, 0x00, 0x5B, 0x00, 0x00, 0x5D, 0x00, 0x00, 0xFF, 0x21, 0x01,
            0x00, 0x00, 0x90, 0x48, 0x50, 0x83, 0x47, 0x48, 0x00, 0x19, 0x4C, 0x50, 0x83, 0x47, 0x4C, 0x00,
            0x19, 0x4F, 0x50, 0x83, 0x47, 0x4F, 0x00, 0x19, 0x54, 0x50, 0x83, 0x47, 0x54, 0x00, 0x01, 0xFF,
            0x2F, 0x00, 0x4D, 0x54, 0x72, 0x6B, 0x00, 0x00, 0x00, 0x0F, 0x00, 0xFF, 0x59, 0x02, 0x01, 0x00,
            0x00, 0xFF, 0x21, 0x01, 0x00, 0x01, 0xFF, 0x2F, 0x00])
    );
    let song: SongJson;
    beforeEach(() => {
        service = new Midi2JsonService();
        song = service.getMidiObject(midiBytesOfSongWithTwoTracks);
    });
    it('Number of tracks of midi song with 2 tracks should be 2', () => {
        expect(song.tracksCount).toBe(2);
    });
    it('ticksSinceStart property must be added to every event in each track', () => {
        const events: MidiEvent[] = song.tracks[0].events;
        let thereAreEventsWithoutProperty = false;
        for (const event of events) {
            if (event.ticksSinceStart === null) {
                thereAreEventsWithoutProperty = true;
            }
        }
        expect(thereAreEventsWithoutProperty).toBe(false, 'There are events without the ticksSinceStart property');
    }
    );
});

describe('Test of Midi2JsonService: json -> midi', () => {
    let service: Midi2JsonService;
    let checker: MidiFileCheckerService;
    const songWithTwoTracks: SongJson = new SongJson(1, 120);
    songWithTwoTracks.tracks = [new Track([]), new Track([])];
    // Tempo
    songWithTwoTracks.tracks[0].events.push(new MidiEvent({
        delta: 0, type: 0xFF, subtype: 0x51, tempo: 750000,
        tempoBPM: 80, ticksSinceStart: 0
    }));
    // Time signature
    songWithTwoTracks.tracks[0].events.push(new MidiEvent({
        delta: 0, type: 0xFF, subtype: 0x58, param1: 4, param2: 2, param3: 24, param4: 8,
        ticksSinceStart: 0
    }));
    // End of first track
    songWithTwoTracks.tracks[0].events.push(new MidiEvent({
        delta: 10, type: 0xFF, subtype: 0x2F, ticksSinceStart: 10
    }));
    // Note one on second track
    songWithTwoTracks.tracks[1].events.push(new MidiEvent({
        delta: 15, type: 0x8, subtype: 0x9, param1: 76, param2: 52,
        ticksSinceStart: 15
    }));
    // Note one off second track
    songWithTwoTracks.tracks[1].events.push(new MidiEvent({
        delta: 15, type: 0x8, subtype: 0x8, param1: 76, param2: 127,
        ticksSinceStart: 30
    }));
    // End of first track
    songWithTwoTracks.tracks[1].events.push(new MidiEvent({
        delta: 10, type: 0xFF, subtype: 0x2F, ticksSinceStart: 25
    }));
    let song: Uint8Array;
    beforeEach(() => {
        service = new Midi2JsonService();
        checker = new MidiFileCheckerService();
        song = service.getMidiBytes(songWithTwoTracks);
    });
    it('Generated MIDI bytes must pass the verification of MIDI standard', () => {
        expect(checker.check(song)).toBe('OK');
    });

});
