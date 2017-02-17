import {League} from './League';
import {Point} from './Point';
import {Comment} from './Comment';
import {GamePlayer} from './GamePlayer';
import {GameTeam} from './GameTeam';

export enum GameSide {
    RED, BLUE
}

export class Game {
    id: string;
    time: Date;
    finished: boolean;
    points: Point[] = [];
    comments: Comment[] = [];
    gamePlayers: GamePlayer[] = [];
    gameTeams: GameTeam[] = [];
    league: League;

    constructor(id: string, time?: string, finished: boolean = true) {
        if (!id) {
            throw new Error('Game.id can not be null');
        }
        this.id = id;
        this.time = this.parseDate(time);
        this.finished = finished;
    }

    static fromJson(json: any): Game {
        let g = new Game(json.id, json.time, json.finished);
        if (json.points && json.points.length > 0) {
            g.points = json.points.map(point => Point.fromJson(point));
        }
        if (json.comments && json.comments.length > 0) {
            g.comments = json.comments.map(comment => Comment.fromJson(comment));
        }
        if (json.gamePlayers && json.gamePlayers.length > 0) {
            g.gamePlayers = json.gamePlayers.map(gamePlayer => GamePlayer.fromJson(gamePlayer));
        }
        if (json.gameTeams && json.gameTeams.length > 0) {
            g.gameTeams = json.gameTeams.map(gameTeam => GameTeam.fromJson(gameTeam));
        }
        if (json.league) {
            g.league = League.fromJson(json.league);
        }
        return g;
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
