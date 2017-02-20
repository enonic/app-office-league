import {Entity} from './Entity';
import {DateUtil} from './DateUtil';
import {Player} from './Player';
import {Side, SideUtil} from './Side';

export class GamePlayer extends Entity {
    time: Date;
    score: number;
    side: Side;
    winner: boolean;
    ratingDelta: number;
    player: Player;

    constructor(id: string) {
        super(id);
    }

    static fromJson(json: any) {
        let gamePlayer = new GamePlayer(json.id);
        gamePlayer.time = json.time && DateUtil.parseDate(json.time);
        gamePlayer.score = json.score;
        gamePlayer.side = SideUtil.parse(json.side);
        gamePlayer.winner = json.winner;
        gamePlayer.ratingDelta = json.ratingDelta;
        gamePlayer.player = json.player && Player.fromJson(json.player);
        return gamePlayer;
    }
}