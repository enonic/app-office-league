import {Entity} from './Entity';
import {DateUtil} from './DateUtil';
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
    live: boolean;

    constructor(id: string) {
        super(id);
        this.live = false;
    }

    static fromJson(json: any): Game {
        let game = new Game(json.id);
        game.time = json.time && DateUtil.parseDate(json.time);
        game.finished = json.finished;
        game.points = json.points && json.points.map(point => Point.fromJson(point));
        game.comments = json.comments ? json.comments.map(comment => Comment.fromJson(comment)) : [];
        game.gamePlayers = json.gamePlayers && json.gamePlayers.map(gamePlayer => GamePlayer.fromJson(gamePlayer));
        game.gameTeams = json.gameTeams && json.gameTeams.map(gameTeam => GameTeam.fromJson(gameTeam));
        game.league = json.league && League.fromJson(json.league);
        return game;
    }
}
