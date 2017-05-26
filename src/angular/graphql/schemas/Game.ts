import {Entity} from './Entity';
import {DateUtil} from './DateUtil';
import {League} from './League';
import {Point} from './Point';
import {Comment} from './Comment';
import {GamePlayer} from './GamePlayer';
import {GameTeam} from './GameTeam';

export class Game
    extends Entity {
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
        game.time = json.time && DateUtil.parseDate(json.time);
        game.finished = json.finished;
        game.points = json.points && json.points.map(point => Point.fromJson(point));
        game.comments = json.comments ? json.comments.map(comment => comment.author && Comment.fromJson(comment)).filter((c) => !!c) : [];
        game.gamePlayers = json.gamePlayers ? json.gamePlayers.map(gp => GamePlayer.fromJson(gp)).sort(Game.compareGamePlayer) : [];
        game.gameTeams = json.gameTeams && json.gameTeams.map(gameTeam => GameTeam.fromJson(gameTeam));
        game.league = json.league && League.fromJson(json.league);
        return game;
    }

    static generateClientId(): string {
        return 'game-id-' + Date.now() + '-' + (Math.floor(Math.random() * 100000));
    }

    static isClientId(id: string): boolean {
        return id.indexOf('game-id-') === 0;
    }

    private static compareGamePlayer(gp1: GamePlayer, gp2: GamePlayer) {
        return (gp1.position || 0) - (gp2.position || 0);
    }
}
