import {Side} from '../../graphql/schemas/Side';

export class TimelineEntry {
    name: string;
    teamName: string;
    timeOffset: number;
    time: string;
    text: string;
    score: string;
    side: string;
    isComment: boolean;
    imageUrl: string;

    constructor(name: string, teamName: string, timeOffset: number, text: string, score: string, side: Side) {
        this.name = name;
        this.teamName = teamName;
        this.timeOffset = timeOffset;
        this.time = this.formatTime(timeOffset);
        this.text = text;
        this.score = score;
        this.side = side === Side.BLUE ? 'blue' : 'red';
        this.isComment = false;
    }

    private formatTime(seconds: number): string {
        return Math.floor(seconds / 60) + "'" + this.zerofill(seconds % 60) + '"';
    }

    private zerofill(value: number): string {
        return value > 9 ? String(value) : `0${value}`;
    }

}
