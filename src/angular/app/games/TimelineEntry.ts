import {GameTeam} from '../../graphql/schemas/GameTeam';

export class TimelineEntry {
    name: string;
    team: GameTeam;
    time: string;
    comment: string;
    score: string;
    side: string;

    constructor(name: string, team: GameTeam, time: number, comment: string, score: string, side: string) {
        this.name = name;
        this.team = team;
        this.time = this.formatTime(time);
        this.comment = comment;
        this.score = score;
        this.side = side;
    }

    private formatTime(seconds: number): string {
        return Math.floor(seconds / 60) + "'" + this.zerofill(seconds % 60) + '"';
    }

    private zerofill(value: number): string {
        return value > 9 ? String(value) : `0${value}`;
    }

}
