import {Player} from './Player';

export class Goal {
    player: Player;
    time: number;
    against: Boolean;

    constructor(player: Player) {
        if (!player) {
            throw new Error('Goal.player can not be null');
        }
        this.player = player;
    }

    static fromJson(json): Goal {
        let g = new Goal(Player.fromJson(json.player));
        if (json.time) {
            g.time = json.time;
        }
        if (json.against != undefined) {
            g.against = json.against;
        }
        return g;
    }
}
