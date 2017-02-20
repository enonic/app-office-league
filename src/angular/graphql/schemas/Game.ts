import {Entity} from './Entity';
import {League} from './League';
import {Point} from './Point';
import {Comment} from './Comment';
import {GamePlayer} from './GamePlayer';
import {GameTeam} from './GameTeam';

export class Game extends Entity {
    time: Date;
    finished: boolean;
    points: Point[] = [];
    comments: Comment[] = [];
    gamePlayers: GamePlayer[] = [];
    gameTeams: GameTeam[] = [];
    league: League;

    constructor(id: string) {
        super(id);
    }

    static fromJson(json: any): Game {
        let game = new Game(json.id);
        game.time = json.time && Game.parseDate(json.time);
        game.finished = json.finished;
        game.points = json.points && json.points.map(point => Point.fromJson(point));
        game.comments = json.comments && json.comments.map(comment => Comment.fromJson(comment));
        game.gamePlayers = json.gamePlayers && json.gamePlayers.map(gamePlayer => GamePlayer.fromJson(gamePlayer));
        game.gameTeams = json.gameTeams && json.gameTeams.map(gameTeam => GameTeam.fromJson(gameTeam));
        game.league = json.league && League.fromJson(json.league);
        return game;
    }

    static parseDate(value: string): Date { //TODO Extract
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
