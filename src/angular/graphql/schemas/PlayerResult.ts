import {Player} from './Player';

export class PlayerResult {
    player: Player;
    goals: number = 0;
    goalsAgainst: number = 0;
    ratingChange: number;

    constructor(player: Player) {
        if (!player) {
            throw new Error('PlayerResult.player can not be null');
        }
        this.player = player;
    }

    static fromJson(json): PlayerResult {
        let r = new PlayerResult(Player.fromJson(json.player));
        if (json.goals) {
            r.goals = json.goals;
        }
        if (json.goalsAgainst) {
            r.goalsAgainst = json.goalsAgainst;
        }
        if (json.ratingChange) {
            r.ratingChange = json.ratingChange;
        }
        return r;
    }
}
