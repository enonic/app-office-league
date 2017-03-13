import {GameTeam} from '../../graphql/schemas/GameTeam';

export class TimelineEntry {
    name: string;
    team: GameTeam;
    time: string;
    comment: string;
    score: string;
    side: string;
    color: string;

    constructor(name: string, team: GameTeam, time: string, comment: string, score: string, side: string, color: string) {
        this.name = name;
        this.team = team;
        this.time = time;
        this.comment = comment;
        this.score = score;
        this.side = side;
        this.color = color;
    }
}
