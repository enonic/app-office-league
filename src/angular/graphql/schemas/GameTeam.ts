import {Team} from './Team';
import {GameSide} from './Game';

export class GameTeam {
    id: string;
    time: Date;
    score: number;
    side: GameSide;
    winner: boolean;
    ratingDelta: number;
    team: Team;

    constructor(team: Team, time?: string, score: number = 0) {
        if (!team) {
            throw new Error('GameTeam.team can not be null');
        }
        this.team = team;
        this.time = this.parseDate(time);
        this.score = score;
    }

    static fromJson(json: any) {
        let gt = new GameTeam(Team.fromJson(json.team), json.time, json.score);
        gt.side = this.parseSide(json.side);
        if (json.id) {
            gt.id = json.id;
        }
        if (json.winner != undefined) {
            gt.winner = json.winner;
        }
        if (json.ratingDelta) {
            gt.ratingDelta = json.ratingDelta;
        }
        return gt;
    }

    private static parseSide(value: any): GameSide {
        if (typeof value === 'string') {
            return GameSide[value.toUpperCase()];
        }
        return null;
    }

    private parseDate(value: string): Date {
        let parsed: Date;
        if (value) {
            try {
                parsed = new Date(value);
            } catch (e) {
                console.warn(`Could not parse date from: "${value}"`);
            }
        }
        return parsed || new Date();
    }
}