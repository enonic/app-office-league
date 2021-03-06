import {Entity} from './Entity';
import {DateUtil} from './DateUtil';
import {Player} from './Player';
import {Side, SideUtil} from './Side';

export class GamePlayer
    extends Entity {
    time: Date;
    score: number = 0;
    scoreAgainst: number = 0;
    side: Side;
    position: number;
    winner: boolean;
    ratingDelta: number = 0;
    player: Player;

    constructor(id: string) {
        super(id);
    }

    static fromJson(json: any) {
        let gamePlayer = new GamePlayer(json.id);
        gamePlayer.time = json.time && DateUtil.parseDate(json.time);
        gamePlayer.score = json.score || 0;
        gamePlayer.scoreAgainst = json.scoreAgainst || 0;
        gamePlayer.side = SideUtil.parse(json.side);
        gamePlayer.position = json.position || 0;
        gamePlayer.winner = json.winner;
        gamePlayer.ratingDelta = json.ratingDelta;
        gamePlayer.player = json.player && Player.fromJson(json.player);
        return gamePlayer;
    }
}