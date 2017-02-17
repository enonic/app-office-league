import {Player} from './Player';
import {GameSide} from './Game';

export class GamePlayer {
    id: string;
    time: Date;
    score: number;
    side: GameSide;
    winner: boolean;
    ratingDelta: number;
    player: Player;

    constructor(player: Player, time?: string, score: number = 0) {
        if (!player) {
            throw new Error('GamePlayer.player can not be null');
        }
        this.player = player;
        this.time = this.parseDate(time);
        this.score = score;
    }

    static fromJson(json: any) {
        let gp = new GamePlayer(Player.fromJson(json.player), json.time, json.score);
        gp.side = this.parseSide(json.side);
        if (json.id) {
            gp.id = json.id;
        }
        if (json.winner != undefined) {
            gp.winner = json.winner;
        }
        if (json.ratingDelta) {
            gp.ratingDelta = json.ratingDelta;
        }
        return gp;
    }

    private static parseSide(value: any): GameSide {
        if (typeof value === 'string') {
            return GameSide[value.toUpperCase()];
        }
        return null;
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