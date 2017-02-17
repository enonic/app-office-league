import {Player} from './Player';

export class Point {
    time: Date;
    against: boolean;
    player: Player;

    constructor(player: Player, time?: string, against: boolean = false) {
        if (!player) {
            throw new Error('Point.player can not be null');
        }
        this.player = player;
        this.time = this.parseDate(time);
        this.against = against;
    }

    public static fromJson(json: any) {
        return new Point(Player.fromJson(json.player), json.time, json.against);
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