import { Injectable } from '@angular/core';
import { SongJson } from '../../../../core/models/midi/song-json/song-json';
import { TrackNote } from '../../../../core/models/midi/track-note';
import { Instrument } from '../../../../core/models/midi/midi-codes/instrument.enum';
import { SongChords } from '../../../music-analysis/harmony/song-chords';
import { AlterationType } from '../../../music-analysis/harmony/alteration-type.enum';
import { ChordType } from '../../../music-analysis/harmony/chord-type.enum';
import { SongTonality } from '../../../music-analysis/harmony/song-tonality';


@Injectable()
export class SvgBoxService {
    svgns = 'http://www.w3.org/2000/svg';
    colorMusicBar = 'rgb(200,180,170)';
    colorProgressBar = 'rgb(200,0,0)';
    // keyboards are blue
    colorPiano = 'rgb(51,0,153)';
    colorOrgan = 'rgb(71,0,214)';
    colorSynthLead = 'rgb(0,102,153)';
    colorSynthPad = 'rgb(99,20,255)';
    colorSynthEffects = 'rgb(0,0,102)';
    colorEnsemble = 'rgb(122,122,255)';
    // bass is violet
    colorBass = 'rgb(163,0,163)';
    // string are red
    colorGuitar = 'rgb(214,0,0)';
    colorStrings = 'rgb(255,20,99)';
    // viento are green
    colorBrass = 'rgb(0,102,0)';
    colorReed = 'rgb(102,102,0)';
    colorPipe = 'rgb(0,224,0)';
    // drums and percussion are black
    colorDrums = 'rgb(0,0,0)';
    colorPercussion = 'rgb(50,50,50)';
    colorEthnic = 'rgb(100,100,100';
    colorSoundEffects = 'rgb(140,140,140)';

    noteDotRadio= 1;

    private getColor(instrument: Instrument, channel: number): string {
        if (channel === 9) { return this.colorDrums; }
        if (instrument < 8) { return this.colorPiano; }
        if (instrument < 16) { return this.colorPercussion; }
        if (instrument < 24) { return this.colorOrgan; }
        if (instrument < 32) { return this.colorGuitar; }
        if (instrument < 40) { return this.colorBass; }
        if (instrument < 48) { return this.colorStrings; }
        if (instrument < 56) { return this.colorEnsemble; }
        if (instrument < 64) { return this.colorBrass; }
        if (instrument < 72) { return this.colorReed; }
        if (instrument < 80) { return this.colorPipe; }
        if (instrument < 88) { return this.colorSynthLead; }
        if (instrument < 96) { return this.colorSynthPad; }
        if (instrument < 104) { return this.colorSynthEffects; }
        if (instrument < 112) { return this.colorEthnic; }
        if (instrument < 120) { return this.colorPercussion; }
        return this.colorSoundEffects;
    }

    public createProgressBar(
            svgBoxId: string,
            progressBarId: string,
            zoomx: number,
            scrollDisplacementX: number,
            progress: number): any {
        let progressBar = document.getElementById(progressBarId);
        const svgBox = document.getElementById(svgBoxId);
        if (svgBox) {
            const svgBoxWidth = svgBox.clientWidth;
            const x = progress * svgBoxWidth;
            const actualx: number = x * zoomx - scrollDisplacementX;
            this.deleteProgressBar(svgBoxId, progressBarId);
            if (actualx > 0 && actualx < svgBoxWidth) {
                progressBar = this.createLine(actualx, actualx, 0, svgBox.clientHeight, 2,
                    this.colorProgressBar, progressBarId, svgBox);
            }
        }
    }

    public deleteProgressBar(svgBoxId: string, progressBarId: string) {
        const progressBar = document.getElementById(progressBarId);
        const svgBox = document.getElementById(svgBoxId);
        if (progressBar) {
            try {
                svgBox.removeChild(progressBar);
            } catch (error) {
                console.log('The progressBar object is not null, but when trying to remove it an exception was raised');
                console.log(error);
            }
        }
    }

    public createLine(
            x1: number,
            x2: number,
            y1: number,
            y2: number,
            width: number,
            color: string,
            id: string,
            svgBox: any): any {
        const line: any = document.createElementNS(this.svgns, 'line');
        line.setAttributeNS(null, 'width', width);
        line.setAttributeNS(null, 'x1', x1);
        line.setAttributeNS(null, 'x2', x2);
        line.setAttributeNS(null, 'y1', y1);
        line.setAttributeNS(null, 'y2', y2);
        line.setAttributeNS(null, 'style', 'stroke:' + color);
        if (id) {
            line.setAttributeNS(null, 'id', id);
        }
        svgBox.appendChild(line);
        return line;
    }
    private createNote(
            x: number,
            y: number,
            l: number,
            color: string,
            svgBoxId: string): any {
        const svgBox = document.getElementById(svgBoxId);
        const line: any = document.createElementNS(this.svgns, 'line');
        line.setAttributeNS(null, 'width', 1);
        line.setAttributeNS(null, 'x1', x);
        line.setAttributeNS(null, 'x2', x + l);
        line.setAttributeNS(null, 'y1', y);
        line.setAttributeNS(null, 'y2', y);
        line.setAttributeNS(null, 'style', 'stroke:' + color);
        svgBox.appendChild(line);
        return line;
    }

    // returns a reference to the dot created
    private createDot(
            x: number,
            y: number,
            r: number,
            color: string,
            svgBoxId: string): any {
        const svgBox = document.getElementById(svgBoxId);
        const dot: any = document.createElementNS(this.svgns, 'circle');
        dot.setAttributeNS(null, 'cx', x);
        dot.setAttributeNS(null, 'cy', y);
        dot.setAttributeNS(null, 'r', r);
        dot.setAttributeNS(null, 'fill', color);
        svgBox.appendChild(dot);
        return dot;
    }

    private createText(
            text: string,
            x: number,
            y: number,
            fontSize: string,
            svgBox: any) {
        const textElement: any = document.createElementNS(this.svgns, 'text');
        const textNode = document.createTextNode(text);
        textElement.appendChild(textNode);
        textElement.setAttributeNS(null, 'x', x);
        textElement.setAttributeNS(null, 'y', y);
        textElement.setAttributeNS(null, 'font-size', fontSize);
        svgBox.appendChild(textElement);
        return textElement;
    }

    public drawTrackGraphic(
            trackNotesNumber: number,
            svgBoxId: string,
            song: SongJson,
            zoomx: number,
            scrollDisplacementX: number,
            scrollDisplacementY: number,
            createProgressBar: boolean,
            progressBarId?: string): string {
        const svgBox = document.getElementById(svgBoxId);
        if (!svgBox) {
            return;
        }
        const svgBoxWidth = svgBox.clientWidth;
        const svgBoxHeight = svgBox.clientHeight;
        this.cleanSvg(svgBoxId);
        let horizontalScale: number = svgBoxWidth / song.durationInTicks;
        horizontalScale = horizontalScale * zoomx;

        const thisTrack = song.notesTracks[trackNotesNumber];
        const pitchSpaceLength = 128;
        const verticalScale: number = svgBoxHeight / pitchSpaceLength;
        const instrument = song.notesTracks[trackNotesNumber].instrument;
        const channel = song.notesTracks[trackNotesNumber].channel;
        const color = this.getColor(instrument, channel);


        this.paintNotesTrack(thisTrack.notesSequence, horizontalScale, verticalScale, svgBoxId,
            scrollDisplacementX, scrollDisplacementY, color);

        this.showChords(horizontalScale, svgBoxId, song, scrollDisplacementX);

        this.ShowTonic(horizontalScale, svgBoxId, song, scrollDisplacementX);

        this.createStaffBars(horizontalScale, svgBoxId, song, scrollDisplacementX);
        if (createProgressBar) {
            this.createProgressBar(svgBoxId, progressBarId, zoomx, scrollDisplacementX, 0);
        }
    }

    // Draws in one canvas all tracks mixed together
    public drawTracksCollapsedGraphic(
            svgBoxId: string,
            song: SongJson,
            zoomx: number,
            scrollDisplacementX: number,
            scrollDisplacementY: number,
            createProgressBar: boolean,
            progressBarId?: string): string {

        const svgBox = document.getElementById(svgBoxId);
        if (!svgBox) {
            return;
        }
        const svgBoxWidth = svgBox.clientWidth;
        const svgBoxHeight = svgBox.clientHeight;
        this.cleanSvg(svgBoxId);
        let horizontalScale: number = svgBoxWidth / song.durationInTicks;
        horizontalScale = horizontalScale * zoomx;

        const pitchSpaceLength = 128;
        const verticalScale: number = svgBoxHeight / pitchSpaceLength;
        for (const track of song.notesTracks) {
            const instrument = track.instrument;
            const channel = track.channel;
            const color = this.getColor(instrument, channel);

            this.paintNotesTrack(track.notesSequence, horizontalScale, verticalScale, svgBoxId,
                scrollDisplacementX, scrollDisplacementY, color);
            this.showChords(horizontalScale, svgBoxId, song, scrollDisplacementX);
            this.ShowTonic(horizontalScale, svgBoxId, song, scrollDisplacementX);
        }
        this.createStaffBars(horizontalScale, svgBoxId, song, scrollDisplacementX);
        if (createProgressBar) {
            this.createProgressBar(svgBoxId, progressBarId, zoomx, scrollDisplacementX, 0);
        }
    }
    private paintNotesTrack(
            noteSeq: TrackNote[],
            horizontalScale: number,
            verticalScale: number,
            svgBoxId: string,
            scrollDisplacementX: number,
            scrollDisplacementY: number,
            color: string) {
        const svgBox = document.getElementById(svgBoxId);
        const svgBoxWidth = svgBox.clientWidth;
        const svgBoxHeight = svgBox.clientHeight;
        for (const note of noteSeq) {
            const cx: number = note.ticksFromStart * horizontalScale;
            const cy: number = svgBoxHeight - note.pitch * verticalScale;
            if (cx - scrollDisplacementX < svgBoxWidth &&
                cx - scrollDisplacementX > 0 &&
                cy - scrollDisplacementY < svgBoxHeight &&
                cy - scrollDisplacementY > 0) {
                this.createNote(cx - scrollDisplacementX, cy - scrollDisplacementY,
                    note.duration * horizontalScale, color, svgBoxId);
            }
        }
    }
    private createStaffBars(
                horizontalScale: number,
                svgBoxId: string,
                song: SongJson,
                scrollDisplacement: number) {
        const svgBox = document.getElementById(svgBoxId);
        if (svgBox) {
            const svgBoxWidth = svgBox.clientWidth;
            const svgBoxHeight = svgBox.clientHeight;
            const fontSize = 10;
            let barx = 0;
            const barwidth = song.getTicksPerBar() * horizontalScale;
            let barNo = 1 + Math.floor(scrollDisplacement / barwidth);
            let xOfPreviousBarNumber = 0
            while (barx < svgBoxWidth) {
                this.createLine(barx, barx, 0, svgBoxHeight, 1, this.colorMusicBar, '', svgBox);
                const xOfText = ((barwidth < 15) || (barNo > 100)) ? barx + 1 : barx + barwidth / 3;
                // Show the bar number if there is enough space between bars
                if (xOfText - xOfPreviousBarNumber > 20) {
                    this.createText(barNo.toString(), xOfText, fontSize, fontSize.toString(), svgBox);
                    xOfPreviousBarNumber = xOfText;
                }
                barx += barwidth;
                barNo++;
            }
        }
    }

    private showChords(
            horizontalScale: number,
            svgBoxId: string,
            song: SongJson,
            scrollDisplacement: number) {
        const svgBox = document.getElementById(svgBoxId);
        if (svgBox) {
            const svgBoxWidth = svgBox.clientWidth;
            const svgBoxHeight = svgBox.clientHeight;
            const fontSize = 9;
            let beatx = 0;
            const beatwidth = song.ticksPerBeat * horizontalScale;
            if (beatwidth < 25) { return; }
            let beatNo = 1 + Math.floor(scrollDisplacement / beatwidth);
            const chordsSequence = new SongChords(song);
            while (beatx < svgBoxWidth) {
                const chord = chordsSequence.getChordAtBeat(beatNo);
                if (chord && (chord.chordType !== ChordType.NotAchord) && (chord.chordType !== ChordType.Unknown)) {
                    const xOfText = beatx + 1;
                    this.createText(chord.getRepresentation(AlterationType.none), xOfText, svgBoxHeight - (2 * fontSize),
                        fontSize.toString(), svgBox);
                }
                beatx += beatwidth;
                beatNo++;
            }
        }
    }

    private ShowTonic(
            horizontalScale: number,
            svgBoxId: string,
            song: SongJson,
            scrollDisplacement: number) {
        const svgBox = document.getElementById(svgBoxId);
        if (svgBox) {
            const svgBoxWidth = svgBox.clientWidth;
            const svgBoxHeight = svgBox.clientHeight;
            const fontSize = 9;
            let beatx = 0;
            const beatwidth = song.ticksPerBeat * horizontalScale;
            let beatNo = 1 + Math.floor(scrollDisplacement / beatwidth);
            const tonics = new SongTonality(song);
            let previousTonic = null;
            while (beatx < svgBoxWidth) {
                const tonic = tonics.tonics[beatNo];
                // If tonic hasn't changed, don't do anything
                if (previousTonic && tonic && tonic.pitch === previousTonic.pitch && tonic.mode === previousTonic.mode) {
                    beatNo++;
                    beatx += beatwidth;
                    continue;
                }
                if (tonic) {
                    const xOfText = beatx + 1;
                    this.createText(tonic.getRepresentation(), xOfText, svgBoxHeight - fontSize,
                        fontSize.toString(), svgBox);
                }
                previousTonic = tonic;
                beatx += beatwidth;
                beatNo++;
            }
        }
    }

    // Cleans the graphic and the information svg boxes
    private cleanSvg(svgBoxId: string) {
        let svgBox = document.getElementById(svgBoxId);
        const parentElement = svgBox.parentElement;
        const emptySvg = svgBox.cloneNode(false);
        parentElement.removeChild(svgBox);
        parentElement.appendChild(emptySvg);
        svgBox = document.getElementById(svgBoxId);
    }
}
