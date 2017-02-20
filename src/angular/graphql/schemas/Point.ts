import {Player} from './Player';

export class Point {
    time: number;
    against: boolean;
    player: Player;

    constructor() {
    }

    public static fromJson(json: any) {
        let point = new Point();
        point.time = json.time;
        point.against = json.against;
        point.player = json.player && Player.fromJson(json.player);
        return point;
    }
}