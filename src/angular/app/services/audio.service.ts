import {Injectable} from '@angular/core';
import {WindowRefService} from './window-ref.service';
import {XPCONFIG} from '../app.config';


export interface WebAudioSound {
    play(): void;
    stop(): void;
    getVolume(): number;
    setVolume(volume: number);
    getUrl(): string;
}

@Injectable()
export class AudioService {
    private _window: Window;
    private initialized: boolean;
    private webAudioAPISoundManager: WebAudioAPISoundManager;

    constructor(windowRef: WindowRefService) {
        this._window = windowRef.nativeWindow;
    }

    public initialize(): void {
        try {
            let window = <any>this._window;
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            window.audioContext = new window.AudioContext();
            this.webAudioAPISoundManager = this.webAudioAPISoundManager || new WebAudioAPISoundManager(window.audioContext);
        } catch (e) {
            console.log("No Web Audio API support");
        }
    }

    public newSound(soundFile: string, loop: boolean = false): WebAudioSound {
        if (!this.initialized) {
            this.initialize();
            this.initialized = true;
        }
        let url = XPCONFIG.audioUrl + soundFile;
        return new WebAudioAPISound(url, loop, this.webAudioAPISoundManager);
    }

    public stopSound(soundFile: string) {
        let url = XPCONFIG.audioUrl + soundFile;
        this.webAudioAPISoundManager.stopSoundWithUrl(url);
    }
}

class WebAudioAPISoundManager {

    public bufferList: { [key: string]: AudioBuffer };
    public playingSounds: { [key: string]: AudioBufferSourceNode[] };

    constructor(public context: AudioContext) {
        this.bufferList = {};
        this.playingSounds = {};
    }

    addSound(url) {
        // load sound buffer asynchronously
        let request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        request.onload = () => {
            // asynchronously decode the audio file data in request.response
            this.context.decodeAudioData(
                request.response,
                (buffer: AudioBuffer) => {
                    if (!buffer) {
                        console.warn('Error decoding sound file from: ' + url);
                        return;
                    }
                    this.bufferList[url] = buffer;
                });
        };

        request.onerror = () => {
            console.warn('WebAudioAPISoundManager. BufferLoader XHR error');
        };

        request.send();
    }

    stopSoundWithUrl(url) {
        if (this.playingSounds.hasOwnProperty(url)) {
            for (let i in this.playingSounds[url]) {
                if (this.playingSounds[url].hasOwnProperty(i)) {
                    try {
                        this.playingSounds[url][i].stop(0);
                    } catch (e) {
                        console && console.warn('Could not stop sound: ' + url, e);
                    }
                }
            }
        }
    }
}

class WebAudioAPISound {

    private manager: WebAudioAPISoundManager;
    private volume: number;

    constructor(private url: string, private loop: boolean = false, soundManager: WebAudioAPISoundManager) {
        this.url = url;
        this.manager = soundManager;
        this.manager.addSound(this.url);
    }

    play() {
        let buffer = this.manager.bufferList[this.url];
        //Only play if it's loaded yet
        if (typeof buffer !== "undefined") {
            let source = this.makeSource(buffer);
            source.loop = this.loop;
            source.start(0);

            if (!this.manager.playingSounds.hasOwnProperty(this.url)) {
                this.manager.playingSounds[this.url] = [];
            }
            this.manager.playingSounds[this.url].push(source);
        } else {
            console.warn('Sound not loaded yet (' + this.url + '), could not be played');
        }
    }

    stop() {
        this.manager.stopSoundWithUrl(this.url);
    }

    getVolume(): number {
        return this.translateVolume(this.volume, true);
    }

    // expected in range 0-100
    setVolume(volume: number) {
        this.volume = this.translateVolume(volume);
    }

    private translateVolume(volume: number, inverse: boolean = false): number {
        return inverse ? volume * 100 : volume / 100;
    }

    private makeSource(buffer: AudioBuffer): AudioBufferSourceNode {
        let source: AudioBufferSourceNode = this.manager.context.createBufferSource();
        let gainNode: GainNode = this.manager.context.createGain();
        // gainNode.gain.value = this.volume;
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.manager.context.destination);
        return source;
    }

    getUrl(): string {
        return this.url;
    }
}