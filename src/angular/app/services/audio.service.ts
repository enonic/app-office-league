import {Injectable} from '@angular/core';
import {WindowRefService} from './window-ref.service';
import {Config} from '../app.config';

declare var XPCONFIG: Config;

export interface WebAudioSound {
    play(): void;
    stop(): void;
    getVolume(): number;
    setVolume(volume: number);
    getUrl(): string;
}

@Injectable()
export class AudioService {
    public static readonly BACKGROUND_SOUND_FILE = 'sport_soccer_match_stadium_crowd_chant_cheer_001.mp3';
    public static readonly WHISTLE_SOUND_FILE = 'Blastwave_FX_WhistleBlowLong_BWU.693.mp3';
    public static readonly GOAL_SOUND_FILE = 'cheer_8k.mp3';

    private _window: Window;
    private initialized: boolean;
    private webAudioAPISoundManager: WebAudioAPISoundManager;
    private sounds: { [key: string]: WebAudioAPISound };

    constructor(windowRef: WindowRefService) {
        this._window = windowRef.nativeWindow;
        this.sounds = {};
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
        let sound = new WebAudioAPISound(url, loop, this.webAudioAPISoundManager);
        this.sounds[url] = sound;
        return sound;
    }

    public stopSound(soundFile: string) {
        let url = XPCONFIG.audioUrl + soundFile;
        this.webAudioAPISoundManager.stopSoundWithUrl(url);
    }

    public pauseSound(soundFile: string) {
        let url = XPCONFIG.audioUrl + soundFile;
        let sound = this.sounds[url];
        if (sound) {
            sound.suspend();
        }
    }

    public resumeSound(soundFile: string) {
        let url = XPCONFIG.audioUrl + soundFile;
        let sound = this.sounds[url];
        if (sound) {
            sound.resume();
        }
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

    resume() {
        if (this.manager.context.resume) {
            try {
                this.manager.context.resume();
            } catch (e) {
                console.log('Could not resume audio context', e);
            }
        }
    }

    suspend() {
        if (this.manager.context.suspend) {
            try {
                this.manager.context.suspend();
            } catch (e) {
                console.log('Could not suspend audio context', e);
            }
        }
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
